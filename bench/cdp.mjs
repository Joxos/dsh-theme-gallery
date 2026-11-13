/**
 * Minimal Chrome DevTools Protocol client over Node's built-in WebSocket.
 *
 * Zero npm dependencies on purpose: the benchmark must run offline against a
 * system browser (Edge/Chrome). One browser-level connection carries global
 * tracing; page commands run on an attached flat session.
 */
import { spawn } from 'node:child_process'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'

const BROWSER_CANDIDATES = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
]

/** First available system Chromium; throws with a clear message when none. */
export function findBrowser() {
  for (const candidate of BROWSER_CANDIDATES) {
    if (existsSync(candidate)) return candidate
  }
  throw new Error('bench: no Edge/Chrome installation found')
}

/** Promise + resolver pair. */
function deferred() {
  let resolve, reject
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

/**
 * One CDP connection. Commands are `{id, method, params, sessionId?}` frames;
 * events arrive as `{method, params, sessionId?}` and are fanned out to
 * listeners. Timeouts fail the command instead of hanging the run.
 */
export class CdpConnection {
  constructor(ws) {
    this.ws = ws
    this.nextId = 1
    this.pending = new Map()
    this.listeners = new Set()
    this.closed = deferred()
    ws.addEventListener('message', (event) => {
      const message = JSON.parse(event.data)
      if (message.id !== undefined) {
        const entry = this.pending.get(message.id)
        if (entry === undefined) return
        this.pending.delete(message.id)
        if (message.error) entry.reject(new Error(`${entry.method}: ${message.error.message}`))
        else entry.resolve(message.result ?? {})
      } else {
        for (const listener of this.listeners) listener(message)
      }
    })
    ws.addEventListener('close', () => this.closed.resolve())
    ws.addEventListener('error', () => this.closed.resolve())
  }

  /** Send one command; `sessionId` routes it to an attached target. */
  send(method, params = {}, sessionId, timeoutMs = 30000) {
    const id = this.nextId++
    const entry = { method, ...deferred() }
    this.pending.set(id, entry)
    const timer = setTimeout(() => {
      this.pending.delete(id)
      entry.reject(new Error(`bench: CDP timeout after ${timeoutMs}ms on ${method}`))
    }, timeoutMs)
    entry.promise.finally(() => clearTimeout(timer))
    this.ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }))
    return entry.promise
  }

  /** Subscribe to CDP events; returns an unsubscribe function. */
  onEvent(listener) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  close() {
    try {
      this.ws.close()
    } catch {
      /* already closed */
    }
  }
}

/** Launch a system Chromium with a private profile and attach over CDP. */
export async function launchBrowser({ headless = true, width = 2560, height = 1440, extraArgs = [] } = {}) {
  const executable = findBrowser()
  const profileDir = path.join(process.env.TEMP ?? '.', `dsh-bench-profile-${process.pid}-${Date.now()}`)
  await mkdir(profileDir, { recursive: true })
  const args = [
    '--remote-debugging-port=0', // DevToolsActivePort picks a free port; no collisions
    `--user-data-dir=${profileDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-default-apps',
    '--disable-extensions',
    '--disable-background-networking',
    '--disable-component-update',
    '--disable-sync',
    '--metrics-recording-only',
    '--mute-audio',
    '--hide-scrollbars',
    '--force-color-profile=srgb',
    `--window-size=${width},${height}`,
    ...(headless ? ['--headless=new'] : []),
    ...extraArgs,
    'about:blank',
  ]
  const child = spawn(executable, args, { windowsHide: true, stdio: 'ignore' })
  child.unref()

  // The browser writes "<port>\n<ws path>" to DevToolsActivePort once ready.
  const portFile = path.join(profileDir, 'DevToolsActivePort')
  let port
  for (let attempt = 0; attempt < 200; attempt++) {
    try {
      const [first] = (await readFile(portFile, 'utf8')).split(/\r?\n/)
      if (first) {
        port = Number(first)
        if (Number.isFinite(port) && port > 0) break
      }
    } catch {
      /* not written yet */
    }
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  if (port === undefined) {
    child.kill()
    throw new Error(`bench: browser did not write ${portFile}`)
  }

  const versionUrl = `http://127.0.0.1:${port}/json/version`
  let version
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      const response = await fetch(versionUrl)
      if (response.ok) {
        version = await response.json()
        break
      }
    } catch {
      /* not up yet */
    }
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  if (version === undefined) {
    child.kill()
    throw new Error(`bench: browser did not expose ${versionUrl}`)
  }

  const ws = new WebSocket(version.webSocketDebuggerUrl)
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true })
    ws.addEventListener('error', () => reject(new Error('bench: browser WebSocket failed')), { once: true })
  })
  const connection = new CdpConnection(ws)
  return {
    connection,
    executable,
    profileDir,
    /** Synchronous best-effort kill for crash paths where `close()` cannot run. */
    killSync() {
      try {
        child.kill()
      } catch {
        /* already gone */
      }
    },
    async close() {
      connection.close()
      try {
        child.kill()
      } catch {
        /* already gone */
      }
      await rm(profileDir, { recursive: true, force: true }).catch(() => {})
    },
  }
}

/** Create and attach a flat page session. */
export async function openPage(connection, url) {
  const { targetId } = await connection.send('Target.createTarget', { url: 'about:blank' })
  const { sessionId } = await connection.send('Target.attachToTarget', { targetId, flatten: true })
  await connection.send('Page.enable', {}, sessionId)
  await connection.send('Runtime.enable', {}, sessionId)
  await connection.send('Performance.enable', {}, sessionId)
  await connection.send('Log.enable', {}, sessionId)
  await connection.send('Page.navigate', { url }, sessionId)
  await waitForLoad(connection, sessionId)
  return { sessionId, targetId }
}

/** Resolve once the page finished loading (or already had). */
export function waitForLoad(connection, sessionId) {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      unsubscribe()
      resolve()
    }, 15000)
    const unsubscribe = connection.onEvent((message) => {
      if (message.sessionId !== sessionId) return
      if (message.method === 'Page.loadEventFired' || message.method === 'Page.domContentEventFired') {
        clearTimeout(timeout)
        unsubscribe()
        resolve()
      }
    })
  })
}

/** Evaluate an expression in the page and return its JSON value. */
export async function evaluate(connection, sessionId, expression, awaitPromise = true) {
  const result = await connection.send(
    'Runtime.evaluate',
    { expression, awaitPromise, returnByValue: true },
    sessionId,
    60000,
  )
  if (result.exceptionDetails) {
    const detail = result.exceptionDetails.exception?.description ?? result.exceptionDetails.text ?? 'unknown'
    throw new Error(`bench: page exception: ${detail} (${expression.slice(0, 80)})`)
  }
  return result.result?.value
}

/** Capture a viewport screenshot as base64 PNG. */
export async function screenshot(connection, sessionId) {
  const result = await connection.send(
    'Page.captureScreenshot',
    { format: 'png', captureBeyondViewport: false, optimizeForSpeed: false },
    sessionId,
    60000,
  )
  return result.data
}

/**
 * Start a global trace on the browser session. Categories keep the payload
 * small while covering main-thread, compositor and GPU process work. Events
 * are pulled from the completion stream (`transferMode: ReturnAsStream`).
 */
export async function startTracing(connection, categories = 'devtools.timeline,cc,gpu,toplevel') {
  const done = deferred()
  const unsubscribe = connection.onEvent((message) => {
    if (message.method === 'Tracing.tracingComplete') done.resolve(message.params)
  })
  await connection.send('Tracing.start', {
    transferMode: 'ReturnAsStream',
    traceConfig: { includedCategories: categories.split(',') },
  }).catch(async (error) => {
    // A crashed previous run can leave tracing active on a reused browser;
    // end it and retry once.
    if (!/already been started/i.test(error.message)) throw error
    await connection.send('Tracing.end').catch(() => {})
    await new Promise((resolve) => setTimeout(resolve, 250))
    await connection.send('Tracing.start', {
      transferMode: 'ReturnAsStream',
      traceConfig: { includedCategories: categories.split(',') },
    })
  })
  return {
    async stop() {
      await connection.send('Tracing.end')
      // Never hang the matrix on a stuck trace: degrade to an empty summary.
      const params = await Promise.race([
        done.promise,
        new Promise((resolve) => setTimeout(() => resolve(null), 60000)),
      ])
      unsubscribe()
      if (params === null) {
        console.warn('bench: tracing did not complete in 60s; using an empty summary')
        return []
      }
      const parts = []
      for (;;) {
        const chunk = await connection.send('IO.read', { handle: params.stream }, undefined, 60000)
        parts.push(chunk.data)
        if (chunk.eof) break
      }
      await connection.send('IO.close', { handle: params.stream }).catch(() => {})
      return JSON.parse(parts.join(''))
    },
  }
}

/** Summarise trace events into per-process/thread CPU totals and key slices. */
export function summariseTrace(events) {
  const list = Array.isArray(events) ? events : (events?.traceEvents ?? [])
  const processNames = new Map()
  const threadNames = new Map()
  const totals = new Map()
  const slices = new Map()
  const names = new Map()
  for (const event of list) {
    if (event.ph === 'M' && event.name === 'process_name') {
      processNames.set(event.pid, event.args?.name ?? 'unknown')
      continue
    }
    if (event.ph === 'M' && event.name === 'thread_name') {
      threadNames.set(`${event.pid}:${event.tid}`, event.args?.name ?? 'unknown')
      continue
    }
    const dur = typeof event.dur === 'number' ? event.dur : 0
    if (dur <= 0) continue
    names.set(event.name, (names.get(event.name) ?? 0) + dur)
    const processName = processNames.get(event.pid) ?? `pid${event.pid}`
    const threadName = threadNames.get(`${event.pid}:${event.tid}`) ?? `tid${event.tid}`
    const key = `${processName} / ${threadName}`
    totals.set(key, (totals.get(key) ?? 0) + dur)
    if (
      event.name === 'RunTask' ||
      event.name === 'CompositeLayers' ||
      event.name === 'Paint' ||
      event.name === 'RasterTask' ||
      event.name === 'Layout' ||
      event.name === 'UpdateLayoutTree' ||
      event.name === 'Animation' ||
      event.name === 'PrePaint'
    ) {
      slices.set(event.name, (slices.get(event.name) ?? 0) + dur)
    }
  }
  const toMs = (µs) => Math.round((µs / 1000) * 10) / 10
  return {
    threads: Object.fromEntries([...totals].map(([key, µs]) => [key, toMs(µs)])),
    slices: Object.fromEntries([...slices].map(([key, µs]) => [key, toMs(µs)])),
    events: Object.fromEntries(
      [...names]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 30)
        .map(([key, µs]) => [key, toMs(µs)]),
    ),
    eventCount: list.length,
  }
}

/** Persist one JSON artefact under bench/out. */
export async function writeJson(dir, name, value) {
  await mkdir(dir, { recursive: true })
  const file = path.join(dir, `${name}.json`)
  await writeFile(file, JSON.stringify(value, null, 2))
  return file
}

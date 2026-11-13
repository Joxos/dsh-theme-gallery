/**
 * Benchmark driver: launch a system Chromium, run every ambient variant
 * through the workloads, capture steady-state metrics and golden frames,
 * and write JSON + a markdown report under bench/out.
 *
 *   node bench/run.mjs                  full matrix
 *   node bench/run.mjs --quick          one theme, short workloads (iteration)
 *   node bench/run.mjs --variants canvas,sprite
 *   node bench/run.mjs --headed         visible window (real desktop GPU)
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { evaluate, launchBrowser, openPage, screenshot, startTracing, summariseTrace, writeJson } from './cdp.mjs'
import { startServer } from './serve.mjs'
import { allCssStrings } from './specs.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..')

const args = process.argv.slice(2)
function flag(name, fallback) {
  const index = args.indexOf(`--${name}`)
  if (index === -1) return fallback
  const next = args[index + 1]
  return next !== undefined && !next.startsWith('--') ? next : true
}
const quick = flag('quick', false) === true
const headed = flag('headed', false) === true
const VARIANTS = String(flag('variants', 'baseline,production,productionTiny,productionMicro,canvas,hybrid')).split(',')
const THEMES = String(flag('themes', quick ? 'light' : 'light,dark')).split(',')
const WORKLOADS = String(flag('workloads', 'idle,stream,menu')).split(',')
const DURATION = Number(flag('duration', quick ? 3000 : 6000))
const WARMUP = Number(flag('warmup', quick ? 800 : 2000))
const REPS = Number(flag('reps', quick ? 1 : 3))
const GOLDEN_TIMES = [0, 4000, 9000, 16000, 26000]
const viewportArg = String(flag('viewport', '2560x1440x1.5'))
const [vw, vh, vdpr] = viewportArg.split('x').map(Number)
const VIEWPORT = { width: vw, height: vh, deviceScaleFactor: vdpr || 1 }

/** Gradient specs must literally exist in the shipped styles. */
async function checkSpecSync() {
  const sources = ['src/client/presets/cyber/style.css', 'src/client/styles/page.css']
    .map((rel) => path.join(root, rel))
  const text = (await Promise.all(sources.map((file) => readFile(file, 'utf8')))).join('\n')
  const missing = allCssStrings().filter((css) => !text.includes(css))
  if (missing.length > 0) {
    throw new Error(`bench: gradient specs drifted from sources:\n  ${missing.join('\n  ')}`)
  }
  console.log(`spec sync ok (${allCssStrings().length} literals checked against src/client)`)
}

async function main() {
  await checkSpecSync()
  const outDir = path.join(here, 'out')
  await mkdir(outDir, { recursive: true })
  const server = await startServer()
  const browser = await launchBrowser({
    headless: !headed,
    width: VIEWPORT.width,
    height: VIEWPORT.height,
    extraArgs: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-gpu-rasterization'],
  })
  const { connection } = browser
  activeBrowser = browser
  const results = { startedAt: new Date().toISOString(), viewport: VIEWPORT, variants: {}, gpu: null }
  console.log(`server ${server.origin} | browser ${browser.executable}`)

  try {
    // One-off: confirm which renderer the browser actually uses.
    results.gpu = await withPage(connection, server.origin, async (sessionId) => {
      return evaluate(
        connection,
        sessionId,
        `(() => {
          const gl = document.createElement('canvas').getContext('webgl')
          const ext = gl && gl.getExtension('WEBGL_debug_renderer_info')
          return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'no-webgl'
        })()`,
      )
    })
    console.log(`webgl renderer: ${results.gpu}`)

    for (const theme of THEMES) {
      for (const variant of VARIANTS) {
        results.variants[`${variant}/${theme}`] = { variant, theme, workloads: {}, golden: [] }
      }

      // ---- steady-state workloads ----
      // Repetitions interleave across every variant/workload cell so thermal
      // and system drift spreads evenly instead of punishing later cells.
      const cells = []
      for (const variant of VARIANTS) {
        for (const workload of WORKLOADS) cells.push({ variant, workload, runs: [] })
      }
      for (let rep = 0; rep < REPS; rep++) {
        for (const cell of cells) {
          const { variant, workload } = cell
          const run = await withPage(connection, `${server.origin}/?theme=${theme}`, async (sessionId) => {
            await emulate(connection, sessionId)
            await evaluate(connection, sessionId, `window.__bench.boot()`)
            const mount = await evaluate(connection, sessionId, `window.__bench.mount(${JSON.stringify(variant)})`)
            await sleep(WARMUP)
            const before = await connection.send('Performance.getMetrics', {}, sessionId)
            const trace = await startTracing(connection)
            const workloadResult = await evaluate(
              connection,
              sessionId,
              `window.__bench.workload(${JSON.stringify(workload)}, ${DURATION})`,
            )
            const events = await trace.stop()
            const after = await connection.send('Performance.getMetrics', {}, sessionId)
            return {
              mount,
              workload: workloadResult,
              trace: summariseTrace(events),
              counters: delta(before.metrics, after.metrics),
            }
          })
          cell.runs.push(run)
          const frames = run.workload.frames ?? {}
          console.log(
            `[rep ${rep + 1}/${REPS}] ${`${cell.variant}/${theme}`.padEnd(22)} ${cell.workload.padEnd(6)} ` +
              `fps=${String(frames.fps ?? '-').padEnd(5)} tex=${run.mount.textures.totalMB}MB ` +
              `main=${run.trace.threads['Renderer / CrRendererMain'] ?? '?'}ms gpu=${run.trace.threads['GPU Process / CrGpuMain'] ?? '?'}ms`,
          )
        }
      }
      for (const cell of cells) {
        const entry = results.variants[`${cell.variant}/${theme}`]
        const mainOf = (r) => r.trace.threads['Renderer / CrRendererMain'] ?? 0
        const gpuOf = (r) => r.trace.threads['GPU Process / CrGpuMain'] ?? 0
        cell.runs.sort((a, b) => mainOf(a) - mainOf(b))
        const run = cell.runs[Math.floor(cell.runs.length / 2)]
        run.reps = cell.runs.map((r) => ({ main: mainOf(r), gpu: gpuOf(r), fps: r.workload.frames?.fps }))
        entry.workloads[cell.workload] = run
        const frames = run.workload.frames ?? {}
        console.log(
          `${`${cell.variant}/${theme}`.padEnd(22)} ${cell.workload.padEnd(6)} fps=${String(frames.fps ?? '-').padEnd(5)} ` +
            `gapP95=${String(frames.gapP95 ?? '-').padEnd(6)} tex=${run.mount.textures.totalMB}MB ` +
            `main=${mainOf(run)}ms gpu=${gpuOf(run)}ms reps=${JSON.stringify(run.reps.map((r) => r.gpu))}`,
        )
      }

      // ---- golden frames (idle scene, deterministic animation time) ----
      for (const variant of VARIANTS) {
        const entry = results.variants[`${variant}/${theme}`]
        if (flag('golden', !quick)) {
          entry.golden = await withPage(connection, `${server.origin}/?theme=${theme}`, async (sessionId) => {
            await emulate(connection, sessionId)
            await evaluate(connection, sessionId, `window.__bench.boot()`)
            await evaluate(connection, sessionId, `window.__bench.mount(${JSON.stringify(variant)})`)
            await sleep(WARMUP)
            const shots = []
            for (const t of GOLDEN_TIMES) {
              await evaluate(connection, sessionId, `window.__bench.seek(${t})`)
              await evaluate(connection, sessionId, `window.__bench.ready()`)
              // Large texture stacks (the baseline) can still be rastering
              // after the seek — at 4K it may need many frames; capture
              // until two frames agree so the gate never sees half-rastered
              // tiles.
              let data = await screenshot(connection, sessionId)
              for (let attempt = 0; attempt < 8; attempt++) {
                await sleep(50)
                await evaluate(connection, sessionId, `window.__bench.ready()`)
                const next = await screenshot(connection, sessionId)
                if (next === data) break
                data = next
              }
              const file = path.join(outDir, `shot-${variant}-${theme}-t${t}.png`)
              await writeFile(file, Buffer.from(data, 'base64'))
              shots.push({ t, file: path.relative(root, file), base64: data })
            }
            return shots
          })
        }
      }
    }

    // ---- visual diff matrix: every golden pair, same theme/T ----
    results.diff = {}
    for (const theme of THEMES) {
      const withGolden = VARIANTS.filter((variant) => (results.variants[`${variant}/${theme}`]?.golden ?? []).length > 0)
      await withPage(connection, `${server.origin}/?theme=${theme}`, async (sessionId) => {
        await evaluate(connection, sessionId, `window.__bench.boot()`)
        for (let i = 0; i < withGolden.length; i++) {
          for (let j = i + 1; j < withGolden.length; j++) {
            const [a, b] = [withGolden[i], withGolden[j]]
            const shotsA = results.variants[`${a}/${theme}`].golden
            const shotsB = results.variants[`${b}/${theme}`].golden
            const diffs = []
            for (let k = 0; k < Math.min(shotsA.length, shotsB.length); k++) {
              const diff = await evaluate(
                connection,
                sessionId,
                `window.__bench.diffPng(${JSON.stringify(shotsA[k].base64)}, ${JSON.stringify(shotsB[k].base64)})`,
              )
              diffs.push({ t: shotsA[k].t, ...diff })
            }
            results.diff[`${a}__${b}/${theme}`] = diffs
            const worst = diffs.reduce(
              (acc, d) => ({
                meanAbs: Math.max(acc.meanAbs, d.meanAbs ?? 0),
                maxChannel: Math.max(acc.maxChannel, d.maxChannel ?? 0),
                pctOver8: Math.max(acc.pctOver8, d.pctOver8 ?? 0),
              }),
              { meanAbs: 0, maxChannel: 0, pctOver8: 0 },
            )
            console.log(`diff ${a} vs ${b} [${theme}]: meanAbs<=${worst.meanAbs} max<=${worst.maxChannel} >8<=${worst.pctOver8}%`)
          }
        }
      })
    }

    // Drop the bulky base64 from the persisted JSON.
    for (const entry of Object.values(results.variants)) {
      entry.golden = (entry.golden ?? []).map(({ t, file }) => ({ t, file }))
    }
    await writeJson(outDir, 'results', results)
    await writeFile(path.join(outDir, 'report.md'), renderReport(results))
    console.log(`report: ${path.relative(root, path.join(outDir, 'report.md'))}`)
  } finally {
    await browser.close()
    await server.close()
  }
}

/** Run `fn` inside a fresh page session, then close the target. */
async function withPage(connection, url, fn) {
  const { sessionId, targetId } = await openPage(connection, url)
  try {
    return await fn(sessionId)
  } finally {
    await connection.send('Target.closeTarget', { targetId }).catch(() => {})
  }
}

async function emulate(connection, sessionId) {
  await connection.send('Emulation.setDeviceMetricsOverride', {
    width: VIEWPORT.width,
    height: VIEWPORT.height,
    deviceScaleFactor: VIEWPORT.deviceScaleFactor,
    mobile: false,
  }, sessionId)
}

function delta(before, after) {
  const toMap = (metrics) =>
    Array.isArray(metrics) ? Object.fromEntries(metrics.map((entry) => [entry.name, entry.value])) : metrics
  const a = toMap(before)
  const b = toMap(after)
  const out = {}
  for (const key of Object.keys(b)) {
    if (typeof b[key] === 'number' && typeof a[key] === 'number') out[key] = Math.round((b[key] - a[key]) * 1000) / 1000
  }
  return out
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Crash paths (unhandled rejections from CDP event handlers included) must
// still take the browser down with the driver, or orphaned browsers with
// active tracing poison the next run.
let activeBrowser = null
for (const signal of ['uncaughtException', 'unhandledRejection']) {
  process.on(signal, (error) => {
    console.error(error)
    activeBrowser?.killSync()
    process.exit(1)
  })
}

function renderReport(results) {
  const lines = []
  lines.push('# Ambient rendering benchmark')
  lines.push('')
  lines.push(`- started: ${results.startedAt}`)
  lines.push(`- viewport: ${results.viewport.width}x${results.viewport.height} @ DPR ${results.viewport.deviceScaleFactor}`)
  lines.push(`- renderer: ${results.gpu}`)
  lines.push('')
  lines.push('## Texture budget and steady-state workloads')
  lines.push('')
  for (const theme of [...new Set(Object.values(results.variants).map((entry) => entry.theme))]) {
    lines.push(`### ${theme}`)
    lines.push('')
    lines.push('| variant | workload | fps | gap p95 | tex MB | renderer main ms | compositor ms | gpu ms | paint ms | raster ms |')
    lines.push('|---|---|---|---|---|---|---|---|---|---|')
    for (const entry of Object.values(results.variants).filter((e) => e.theme === theme)) {
      for (const [workload, run] of Object.entries(entry.workloads)) {
        const frames = run.workload.frames ?? {}
        const threads = run.trace.threads
        lines.push(
          `| ${entry.variant} | ${workload} | ${frames.fps ?? '-'} | ${frames.gapP95 ?? '-'} | ${run.mount.textures.totalMB} | ` +
            `${threads['Renderer / CrRendererMain'] ?? '-'} | ${threads['Renderer / Compositor'] ?? '-'} | ` +
            `${threads['GPU Process / GPU'] ?? threads['gpu / GPU'] ?? '-'} | ${run.trace.slices.Paint ?? '-'} | ${run.trace.slices.RasterTask ?? '-'} |`,
        )
      }
    }
    lines.push('')
  }
  if (results.diff && Object.keys(results.diff).length > 0) {
    lines.push('## Visual diff matrix (golden frames)')
    lines.push('')
    lines.push('| pair | theme | worst meanAbs | worst maxChannel | worst %px >8 |')
    lines.push('|---|---|---|---|---|')
    for (const [key, diffs] of Object.entries(results.diff)) {
      const [pair, theme] = key.split('/')
      const worst = diffs.reduce(
        (acc, d) => ({
          meanAbs: Math.max(acc.meanAbs, d.meanAbs ?? 0),
          maxChannel: Math.max(acc.maxChannel, d.maxChannel ?? 0),
          pctOver8: Math.max(acc.pctOver8, d.pctOver8 ?? 0),
        }),
        { meanAbs: 0, maxChannel: 0, pctOver8: 0 },
      )
      lines.push(`| ${pair} | ${theme} | ${worst.meanAbs} | ${worst.maxChannel} | ${worst.pctOver8} |`)
    }
    lines.push('')
  }
  return lines.join('\n')
}

await main()

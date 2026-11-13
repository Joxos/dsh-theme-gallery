/**
 * Debug utility: inspect CSS animation seek state on the bench page.
 *   node bench/debug-anim.mjs
 */
import { evaluate, launchBrowser, openPage } from './cdp.mjs'
import { startServer } from './serve.mjs'

const server = await startServer()
const browser = await launchBrowser({ headless: true })
try {
  const { sessionId } = await openPage(browser.connection, `${server.origin}/?theme=light`)
  await browser.connection.send('Emulation.setDeviceMetricsOverride', { width: 2560, height: 1440, deviceScaleFactor: 1.5, mobile: false }, sessionId)
  await evaluate(browser.connection, sessionId, 'window.__bench.boot()')
  await evaluate(browser.connection, sessionId, 'window.__bench.mount("baseline")')
  await new Promise((resolve) => setTimeout(resolve, 800))
  const before = await evaluate(browser.connection, sessionId, `window.__bench.seek(0)`)
  const list = await evaluate(
    browser.connection,
    sessionId,
    `document.getAnimations().map(a => ({
      name: a.animationName,
      pseudo: a.effect && a.effect.pseudoElement,
      target: a.effect && a.effect.target ? (a.effect.target.className || a.effect.target.tagName) : null,
      time: a.currentTime,
      state: a.playState,
    }))`,
  )
  console.log('seek returned:', before)
  console.log(JSON.stringify(list, null, 1))
  // Two screenshots at the same seek must be byte-identical if the seek froze everything.
  const { screenshot } = await import('./cdp.mjs')
  const s1 = await screenshot(browser.connection, sessionId)
  await evaluate(browser.connection, sessionId, 'window.__bench.ready()')
  const s2 = await screenshot(browser.connection, sessionId)
  await evaluate(browser.connection, sessionId, 'window.__bench.ready()')
  const s3 = await screenshot(browser.connection, sessionId)
  const diff12 = await evaluate(browser.connection, sessionId, `window.__bench.diffPng(${JSON.stringify(s1)}, ${JSON.stringify(s2)})`)
  const diff13 = await evaluate(browser.connection, sessionId, `window.__bench.diffPng(${JSON.stringify(s1)}, ${JSON.stringify(s3)})`)
  console.log('bytes equal 1/2:', s1 === s2, '| animations:', list.length)
  console.log('pixel diff 1-2:', JSON.stringify(diff12))
  console.log('pixel diff 1-3:', JSON.stringify(diff13))
} finally {
  await browser.close()
  await server.close()
}

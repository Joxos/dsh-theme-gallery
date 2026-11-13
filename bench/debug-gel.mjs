/**
 * Debug utility: inspect the gel canvas after mounting one variant.
 *   node bench/debug-gel.mjs [variant]
 */
import { evaluate, launchBrowser, openPage } from './cdp.mjs'
import { startServer } from './serve.mjs'

const variant = process.argv[2] ?? 'sprite'
const server = await startServer()
const browser = await launchBrowser({ headless: true })
try {
  const { sessionId } = await openPage(browser.connection, `${server.origin}/?theme=light`)
  await browser.connection.send('Emulation.setDeviceMetricsOverride', { width: 2560, height: 1440, deviceScaleFactor: 1.5, mobile: false }, sessionId)
  await evaluate(browser.connection, sessionId, 'window.__bench.boot()')
  await evaluate(browser.connection, sessionId, `window.__bench.mount(${JSON.stringify(variant)})`)
  const info = await evaluate(
    browser.connection,
    sessionId,
    `(() => {
      const canvas = document.querySelector('.dsg-gel')
      if (!canvas) return { present: false }
      const style = getComputedStyle(canvas)
      const rect = canvas.getBoundingClientRect()
      const ctx = canvas.getContext('2d')
      const px = ctx.getImageData(Math.floor(canvas.width * 0.86), Math.floor(canvas.height * 0.2), 1, 1).data
      const px2 = ctx.getImageData(Math.floor(canvas.width * 0.1), Math.floor(canvas.height * 0.3), 1, 1).data
      return {
        present: true,
        backing: [canvas.width, canvas.height],
        rect: [rect.left, rect.top, rect.width, rect.height],
        display: style.display, visibility: style.visibility, opacity: style.opacity,
        position: style.position, zIndex: style.zIndex, mixBlendMode: style.mixBlendMode,
        width: style.width, height: style.height,
        animation: style.animationName,
        pixelNear86: [...px],
        pixelNear10: [...px2],
        afterContent: getComputedStyle(document.body, '::after').content,
      }
    })()`,
  )
  console.log(JSON.stringify(info, null, 1))
} finally {
  await browser.close()
  await server.close()
}

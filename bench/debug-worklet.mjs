/**
 * Probe: is CSS.animationWorklet available and functional in this browser?
 *   node bench/debug-worklet.mjs
 */
import { evaluate, launchBrowser, openPage } from './cdp.mjs'
import { startServer } from './serve.mjs'

const server = await startServer()
const browser = await launchBrowser({ headless: true })
try {
  const { sessionId } = await openPage(browser.connection, `${server.origin}/?theme=light`)
  const result = await evaluate(
    browser.connection,
    sessionId,
    `(async () => {
      const hasApi = typeof CSS !== 'undefined' && !!CSS.animationWorklet
      if (!hasApi) return { hasApi: false }
      const source = "registerAnimator('probe', class { animate(t, effect) { effect.localTime = t } })"
      const url = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }))
      try {
        await CSS.animationWorklet.addModule(url)
      } catch (error) {
        return { hasApi: true, addModuleError: String(error) }
      }
      const el = document.createElement('div')
      document.body.append(el)
      const effect = new KeyframeEffect(el, [{ transform: 'translateX(0px)' }, { transform: 'translateX(100px)' }], {
        duration: 1000, iterations: Infinity, easing: 'ease-in-out', direction: 'alternate', fill: 'both',
      })
      const anim = new WorkletAnimation('probe', effect, document.timeline)
      anim.play()
      await new Promise((r) => setTimeout(r, 300))
      const t1 = anim.currentTime
      anim.pause()
      anim.currentTime = 500
      await new Promise((r) => requestAnimationFrame(r))
      return {
        hasApi: true,
        playWorked: typeof t1 === 'number' && t1 > 0,
        seekWorked: anim.currentTime === 500,
        inGetAnimations: document.getAnimations().includes(anim),
      }
    })()`,
  )
  console.log(JSON.stringify(result, null, 1))
} finally {
  await browser.close()
  await server.close()
}

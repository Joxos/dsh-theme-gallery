/**
 * Ambient-rendering candidates for the benchmark.
 *
 * Every variant reproduces the visible scene of the shipped styles and
 * reports its compositor texture budget through `data-bench-texture` (in
 * backing-store pixels). The measured winner gets ported into `src/client`;
 * the rest stay here as the record of the bake-off.
 *
 *   baseline     the shipped CSS stack, untouched
 *   sprite       every gradient baked into a downscaled canvas that *is* its
 *                compositor layer; motion stays compositor-driven CSS
 *   spriteLight  sprite with the FX blend switched to plus-lighter
 *   canvas       back + FX canvases redrawn at 60fps with blob blending and
 *                the group mask pre-computed; gel is a static canvas
 *   canvasLight  canvas with the FX blend switched to plus-lighter
 *   hybrid       compositor-driven sprite background + canvas FX
 */
import {
  AURORA_BASE,
  AURORA_GRADIENTS,
  BLOB_GRADIENTS,
  GEL_GRADIENTS,
  TEXTURE_CAP,
  bakeBase,
  bakeMask,
  paintGradient,
} from './gradients.js'
import { bakeBlobs, mountAuroraStack, mountGelLayer } from '/src/effects/ambient.js'
import { ANIMATIONS, LAYER_ANIMATIONS, evaluateAnimation } from './easing.js'

const LAYER_IDS = ['a', 'b', 'c', 'd']
const BLOB_IDS = ['A', 'B', 'C', 'D']

/** Linear cap for baked backing stores, in CSS pixels. */
const BAKE_CAP = { base: 640, layer: 384, blob: 512, gel: 880 }

function themeScheme() {
  return document.body.hasAttribute('data-ds-dark-theme') ? 'dark' : 'light'
}

function markTexture(node, w, h) {
  node.dataset.benchTexture = `${Math.max(1, Math.round(w))}x${Math.max(1, Math.round(h))}`
  return node
}

function viewport() {
  return { w: window.innerWidth, h: window.innerHeight, vmax: Math.max(window.innerWidth, window.innerHeight) }
}

function bakeScaleFor(kind, w, h, capScale = 1) {
  return Math.min(1, (BAKE_CAP[kind] * capScale) / Math.max(w, h))
}

/** Append a style override for the duration of one variant mount. */
function addOverride(css) {
  const style = document.createElement('style')
  style.dataset.benchOverride = ''
  style.textContent = css
  document.head.append(style)
  return style
}

/** Pause every CSS animation at absolute time `tMs` for deterministic shots. */
function seekCss(tMs) {
  for (const animation of document.getAnimations()) {
    animation.pause()
    animation.currentTime = tMs
  }
}

function resumeCss() {
  for (const animation of document.getAnimations()) animation.play()
}

/* ------------------------------------------------------------------ */
/* baseline                                                             */
/* ------------------------------------------------------------------ */

/** The shipped baseline DOM: identical classes to plugin.js / StyleFx.js. */
function mountBaselineDom({ fxParent }) {
  const root = document.createElement('div')
  root.className = 'dsg-aurora'
  root.setAttribute('aria-hidden', 'true')
  const layers = {}
  for (const id of LAYER_IDS) {
    const node = document.createElement('div')
    node.className = `dsg-auroraLayer dsg-aurora-${id}`
    root.append(node)
    layers[id] = node
  }
  document.body.append(root)

  const fx = document.createElement('div')
  fx.className = 'dsg-fx'
  fx.setAttribute('aria-hidden', 'true')
  const blobs = {}
  for (const id of BLOB_IDS) {
    const node = document.createElement('div')
    node.className = `dsg-fxBlob dsg-fxBlob${id}`
    fx.append(node)
    blobs[id] = node
  }
  fxParent.append(fx)
  return { root, layers, blobs, fx }
}

/**
 * Reconstruct the historical pure-CSS painting from the spec literals. The
 * production stylesheet now hosts canvases instead of CSS gradients, so the
 * baseline variant reinstates the exact `image()` values the specs record.
 */
function baselinePaintCss() {
  const layerRules = []
  const darkLayerRules = []
  for (const [id, pair] of Object.entries(AURORA_GRADIENTS)) {
    layerRules.push(`.dsg-aurora-${id}{background-image:${pair.light.css}}`)
    darkLayerRules.push(`body[data-ds-dark-theme] .dsg-aurora-${id}{background-image:${pair.dark.css}}`)
  }
  const blobRules = []
  for (const [id, spec] of Object.entries(BLOB_GRADIENTS)) {
    blobRules.push(`.dsg-fxBlob${id}{background:${spec.css}}`)
  }
  const gelImage = (scheme) => GEL_GRADIENTS[scheme].map((spec) => spec.css).join(',')
  return `
    .dsg-aurora{background:${AURORA_BASE.light.css} 50% 50%/160% 160% no-repeat}
    body[data-ds-dark-theme] .dsg-aurora{background:${AURORA_BASE.dark.css} 50% 50%/160% 160% no-repeat}
    .dsg-auroraLayer{background-repeat:no-repeat}
    ${layerRules.join('\n    ')}
    ${darkLayerRules.join('\n    ')}
    .dsg-fx .dsg-fxBlob{background-repeat:no-repeat}
    ${blobRules.join('\n    ')}
    body::after{content:"";position:fixed;inset:-8%;pointer-events:none;z-index:2147483001;
      mix-blend-mode:multiply;background-image:${gelImage('light')};background-repeat:no-repeat;
      animation:dsg-cyber-pulse 12s ease-in-out infinite alternate,
                dsg-cyber-sway 28s ease-in-out infinite alternate}
    body[data-ds-dark-theme]::after{content:"";position:fixed;inset:-8%;pointer-events:none;z-index:2147483001;
      mix-blend-mode:screen;background-image:${gelImage('dark')};background-repeat:no-repeat;
      animation:dsg-cyber-pulse 12s ease-in-out infinite alternate,
                dsg-cyber-sway 28s ease-in-out infinite alternate}
  `
}

function mountBaseline({ fxParent }) {
  const paintCss = addOverride(baselinePaintCss())
  const dom = mountBaselineDom({ fxParent })
  const dpr = window.devicePixelRatio || 1
  // Textures are rasterised at element box x DPR.
  markTexture(dom.root, window.innerWidth * dpr, window.innerHeight * dpr)
  for (const node of Object.values(dom.layers)) {
    const rect = node.getBoundingClientRect()
    markTexture(node, rect.width * dpr, rect.height * dpr)
  }
  for (const node of Object.values(dom.blobs)) {
    const rect = node.getBoundingClientRect()
    markTexture(node, rect.width * dpr, rect.height * dpr)
  }
  // body::after is a pseudo-element: attribute its 116%-inset box explicitly.
  const gel = document.createElement('div')
  gel.style.display = 'none'
  gel.dataset.benchGel = 'pseudo'
  markTexture(gel, window.innerWidth * 1.16 * dpr, window.innerHeight * 1.16 * dpr)
  document.body.append(gel)
  return {
    id: 'baseline',
    seek: seekCss,
    resume: resumeCss,
    destroy() {
      dom.root.remove()
      dom.fx.remove()
      gel.remove()
      paintCss.remove()
    },
  }
}

/* ------------------------------------------------------------------ */
/* gel canvas (shared by sprite / canvas / hybrid)                      */
/* ------------------------------------------------------------------ */

/**
 * Replace `body::after` with a real canvas carrying the same declarations.
 * The gel's motion is transform+opacity only, so the canvas never redraws:
 * CSS keeps animating the element on the compositor.
 */
function mountGelCanvas({ theme, capScale = 1 }) {
  const blend = theme === 'dark' ? 'screen' : 'multiply'
  const style = addOverride(`
    body::after{content:none!important}
    .dsg-gel{position:fixed;left:-8%;top:-8%;width:116%;height:116%;
      pointer-events:none;z-index:2147483001;
      mix-blend-mode:${blend};background-image:none;background-repeat:no-repeat;
      animation:dsg-cyber-pulse 12s ease-in-out infinite alternate,
                dsg-cyber-sway 28s ease-in-out infinite alternate}`)
  const box = { w: window.innerWidth * 1.16, h: window.innerHeight * 1.16 }
  const scale = bakeScaleFor('gel', box.w, box.h, capScale)
  const canvas = document.createElement('canvas')
  canvas.className = 'dsg-gel'
  canvas.width = Math.round(box.w * scale)
  canvas.height = Math.round(box.h * scale)
  const ctx = canvas.getContext('2d')
  for (const spec of GEL_GRADIENTS[theme]) {
    // The CSS radii are absolute px on this box; convert to fractions so the
    // shared radial painter can work at backing resolution.
    paintGradient(ctx, canvas.width, canvas.height, { ...spec, rx: spec.rx / box.w, ry: spec.ry / box.h })
  }
  markTexture(canvas, canvas.width, canvas.height)
  document.body.append(canvas)
  return { style, canvas }
}

/* ------------------------------------------------------------------ */
/* sprite / spriteLight                                                 */
/* ------------------------------------------------------------------ */

function mountSprite({ theme, fxParent, blobBlend, capScale = 1 }) {
  // plus-lighter only swaps the dark-theme `screen` blend; light keeps its
  // `multiply`, which plus-lighter cannot emulate.
  const override = addOverride(
    `.dsg-auroraLayer,.dsg-fxBlob{background-image:none!important}` +
      (blobBlend === 'plus-lighter' ? `body[data-ds-dark-theme] .dsg-fxBlob{mix-blend-mode:plus-lighter}` : ''),
  )

  // The aurora root becomes a transparent container: the static base and the
  // moving layers are canvases that ARE their compositor textures.
  const { root, layers, blobs, fx } = mountBaselineDom({ fxParent })
  root.style.background = 'none'
  const baseRect = root.getBoundingClientRect()
  const baseScale = bakeScaleFor('base', baseRect.width, baseRect.height, capScale)
  const baseCanvas = bakeBase(AURORA_BASE[theme], baseRect.width * baseScale, baseRect.height * baseScale)
  baseCanvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%'
  markTexture(baseCanvas, baseCanvas.width, baseCanvas.height)
  root.prepend(baseCanvas)
  for (const id of LAYER_IDS) {
    const node = layers[id]
    const rect = node.getBoundingClientRect()
    const scale = bakeScaleFor('layer', rect.width, rect.height, capScale)
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(rect.width * scale)
    canvas.height = Math.round(rect.height * scale)
    paintGradient(canvas.getContext('2d'), canvas.width, canvas.height, AURORA_GRADIENTS[id][theme])
    node.replaceWith(canvas)
    canvas.className = `dsg-auroraLayer dsg-aurora-${id}`
    markTexture(canvas, canvas.width, canvas.height)
    layers[id] = canvas
  }
  for (const id of BLOB_IDS) {
    const node = blobs[id]
    const rect = node.getBoundingClientRect()
    const scale = bakeScaleFor('blob', rect.width, rect.height, capScale)
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(rect.width * scale)
    canvas.height = Math.round(rect.height * scale)
    paintGradient(canvas.getContext('2d'), canvas.width, canvas.height, BLOB_GRADIENTS[id])
    node.replaceWith(canvas)
    canvas.className = `dsg-fxBlob dsg-fxBlob${id}`
    markTexture(canvas, canvas.width, canvas.height)
    blobs[id] = canvas
  }
  const gel = mountGelCanvas({ theme, capScale })
  return {
    id: capScale < 1 ? 'spriteTiny' : blobBlend === 'plus-lighter' ? 'spriteLight' : 'sprite',
    seek: seekCss,
    resume: resumeCss,
    destroy() {
      root.remove()
      fx.remove()
      gel.canvas.remove()
      gel.style.remove()
      override.remove()
    },
  }
}

/* ------------------------------------------------------------------ */
/* canvas / canvasLight / hybrid                                        */
/* ------------------------------------------------------------------ */

/**
 * Canvas engine: baked draw sources + per-frame Canvas2D composition.
 * Canvas2D `globalCompositeOperation` implements the same compositing spec
 * as CSS `mix-blend-mode`, and `destination-in` implements the group mask,
 * so the pre-blended FX canvas is pixel-faithful to the CSS stack.
 */
function createCanvasEngine({ theme, fxParent, blobBlend, backMode }) {
  const { w, h, vmax } = viewport()
  const scale = 0.5
  const overrides = []

  // Hidden probe DOM keeps geometry a function of the real CSS classes.
  const probe = document.createElement('div')
  probe.setAttribute('aria-hidden', 'true')
  probe.style.cssText = 'position:fixed;inset:0;visibility:hidden;pointer-events:none;contain:strict'
  const probeRoot = document.createElement('div')
  probeRoot.className = 'dsg-aurora'
  const probeLayers = {}
  for (const id of LAYER_IDS) {
    const node = document.createElement('div')
    node.className = `dsg-auroraLayer dsg-aurora-${id}`
    probeRoot.append(node)
    probeLayers[id] = node
  }
  probe.append(probeRoot)
  const probeBlobs = {}
  const probeFx = document.createElement('div')
  probeFx.className = 'dsg-fx'
  for (const id of BLOB_IDS) {
    const node = document.createElement('div')
    node.className = `dsg-fxBlob dsg-fxBlob${id}`
    probeFx.append(node)
    probeBlobs[id] = node
  }
  probe.append(probeFx)
  document.body.append(probe)

  const readRect = (node) => {
    const r = node.getBoundingClientRect()
    return { x: r.left, y: r.top, w: r.width, h: r.height }
  }
  let geo = {
    layers: Object.fromEntries(LAYER_IDS.map((id) => [id, readRect(probeLayers[id])])),
    blobs: Object.fromEntries(BLOB_IDS.map((id) => [id, readRect(probeBlobs[id])])),
  }

  // ---- background: compositor sprites (hybrid) or redrawn canvas ----
  let backSpriteDom = null
  if (backMode === 'sprite') {
    overrides.push(addOverride(`.dsg-auroraLayer{background-image:none!important}`))
    backSpriteDom = mountBaselineDom({ fxParent: document.createElement('div') })
    backSpriteDom.fx.remove()
    backSpriteDom.root.style.background = 'none'
    const baseScale = bakeScaleFor('base', w, h)
    const baseCanvas = bakeBase(AURORA_BASE[theme], w * baseScale, h * baseScale)
    baseCanvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%'
    markTexture(baseCanvas, baseCanvas.width, baseCanvas.height)
    backSpriteDom.root.prepend(baseCanvas)
    for (const id of LAYER_IDS) {
      const g = geo.layers[id]
      const bakeScale = bakeScaleFor('layer', g.w, g.h)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(g.w * bakeScale)
      canvas.height = Math.round(g.h * bakeScale)
      paintGradient(canvas.getContext('2d'), canvas.width, canvas.height, AURORA_GRADIENTS[id][theme])
      const node = backSpriteDom.layers[id]
      node.replaceWith(canvas)
      canvas.className = `dsg-auroraLayer dsg-aurora-${id}`
      markTexture(canvas, canvas.width, canvas.height)
      backSpriteDom.layers[id] = canvas
    }
    document.body.insertBefore(backSpriteDom.root, document.body.firstChild)
  }

  // ---- canvases ----
  const back = document.createElement('canvas')
  back.width = Math.round(w * scale)
  back.height = Math.round(h * scale)
  back.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:-1;pointer-events:none'
  const fxC = document.createElement('canvas')
  fxC.width = Math.round(w * scale)
  fxC.height = Math.round(h * scale)
  fxC.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none'
  const backCtx = back.getContext('2d')
  const fxCtx = fxC.getContext('2d')

  // Baked draw sources (counted in the texture budget).
  const baseSpec = AURORA_BASE[theme]
  const baseSprite = bakeBase(baseSpec, Math.round(w * scale), Math.round(h * scale))
  markTexture(baseSprite, baseSprite.width, baseSprite.height)
  const layerSprites = {}
  for (const id of LAYER_IDS) {
    const g = geo.layers[id]
    const bakeScale = bakeScaleFor('layer', g.w, g.h)
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(g.w * bakeScale)
    canvas.height = Math.round(g.h * bakeScale)
    paintGradient(canvas.getContext('2d'), canvas.width, canvas.height, AURORA_GRADIENTS[id][theme])
    layerSprites[id] = canvas
    markTexture(canvas, canvas.width, canvas.height)
  }
  const blobSprites = {}
  for (const id of BLOB_IDS) {
    const g = geo.blobs[id]
    const bakeScale = bakeScaleFor('blob', g.w, g.h)
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(g.w * bakeScale)
    canvas.height = Math.round(g.h * bakeScale)
    paintGradient(canvas.getContext('2d'), canvas.width, canvas.height, BLOB_GRADIENTS[id])
    blobSprites[id] = canvas
    markTexture(canvas, canvas.width, canvas.height)
  }
  const maskSprite = bakeMask(4, 64)
  markTexture(maskSprite, maskSprite.width, maskSprite.height)

  if (backMode === 'sprite') {
    baseSprite.removeAttribute('data-bench-texture')
    for (const id of LAYER_IDS) layerSprites[id].removeAttribute('data-bench-texture')
  } else {
    markTexture(back, back.width, back.height)
    document.body.insertBefore(back, document.body.firstChild)
  }
  markTexture(fxC, fxC.width, fxC.height)
  fxParent.append(fxC)

  const gel = mountGelCanvas({ theme })

  const blobBlendMode =
    blobBlend === 'plus-lighter' && theme === 'dark' ? 'plus-lighter' : theme === 'dark' ? 'screen' : 'multiply'
  const blobAlpha = theme === 'dark' ? 0.55 : 0.2
  const toDevice = (cssPx) => cssPx * scale

  function drawBack(timeMs) {
    if (backMode === 'sprite') return
    const ctx = backCtx
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 1
    ctx.drawImage(baseSprite, 0, 0, back.width, back.height)
    for (const id of LAYER_IDS) {
      const g = geo.layers[id]
      const anim = evaluateAnimation(ANIMATIONS[LAYER_ANIMATIONS[`aurora-${id}`]], timeMs)
      ctx.drawImage(
        layerSprites[id],
        toDevice(g.x) + toDevice(anim.x * w),
        toDevice(g.y) + toDevice(anim.y * h),
        toDevice(g.w),
        toDevice(g.h),
      )
    }
  }

  function drawFx(timeMs) {
    const ctx = fxCtx
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 1
    ctx.clearRect(0, 0, fxC.width, fxC.height)
    ctx.globalCompositeOperation = blobBlendMode
    ctx.globalAlpha = blobAlpha
    for (const id of BLOB_IDS) {
      const g = geo.blobs[id]
      const anim = evaluateAnimation(ANIMATIONS[LAYER_ANIMATIONS[`blob-${id.toLowerCase()}`]], timeMs)
      const cx = toDevice(g.x + g.w / 2) + toDevice(anim.x * vmax)
      const cy = toDevice(g.y + g.h / 2) + toDevice(anim.y * vmax)
      ctx.setTransform(1, 0, 0, 1, cx, cy)
      ctx.rotate((anim.r * Math.PI) / 180)
      ctx.scale(anim.s, anim.s)
      ctx.drawImage(blobSprites[id], -toDevice(g.w / 2), -toDevice(g.h / 2), toDevice(g.w), toDevice(g.h))
    }
    // Group mask: CSS mask-image multiplies the group alpha by the ramp.
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'destination-in'
    ctx.drawImage(maskSprite, 0, 0, fxC.width, fxC.height)
    ctx.globalCompositeOperation = 'source-over'
  }

  let timeMs = 0
  let live = false
  let rafId = 0
  function frame(now) {
    if (!live) return
    timeMs = now
    drawBack(timeMs)
    drawFx(timeMs)
    rafId = requestAnimationFrame(frame)
  }

  return {
    id: backMode === 'sprite' ? (blobBlend === 'plus-lighter' ? 'hybridLight' : 'hybrid') : blobBlend === 'plus-lighter' ? 'canvasLight' : 'canvas',
    seek(tMs) {
      live = false
      cancelAnimationFrame(rafId)
      timeMs = tMs
      drawBack(timeMs)
      drawFx(timeMs)
    },
    resume() {
      if (live) return
      live = true
      timeMs = performance.now()
      rafId = requestAnimationFrame(frame)
    },
    destroy() {
      live = false
      cancelAnimationFrame(rafId)
      probe.remove()
      backSpriteDom?.root.remove()
      back.remove()
      fxC.remove()
      gel.canvas.remove()
      gel.style.remove()
      for (const style of overrides) style.remove()
    },
  }
}

/* ------------------------------------------------------------------ */

/** Diagnostic overlays: isolate animation-ticking vs blend-fallback cost. */
const DIAGNOSTIC_CSS = {
  noAnim: `.dsg-auroraLayer,.dsg-fxBlob,.dsg-gel,body::after{animation:none!important}`,
  noGel: `.dsg-gel,body::after{display:none!important}`,
  noFx: `#fxmount{display:none!important}`,
  noLayers: `.dsg-aurora{display:none!important}`,
  noWill: `.dsg-auroraLayer,.dsg-fxBlob,.dsg-gel{will-change:auto!important}`,
  noBlend: `.dsg-fxBlob{mix-blend-mode:normal!important}.dsg-gel,body::after{mix-blend-mode:normal!important}`,
  noMask: `.dsg-fx{-webkit-mask-image:none!important;mask-image:none!important}`,
  onlyDrifts: `.dsg-fxBlob,body::after{animation:none!important}`,
  onlyGelFx: `.dsg-auroraLayer{animation:none!important}`,
  lightBlend: `body[data-ds-dark-theme] .dsg-fxBlob{mix-blend-mode:plus-lighter}`,
  // vw/vh/vmax/% in keyframes force per-frame main-thread unit resolution in
  // Blink; these px equivalents (2560x1440 bench viewport) test the mechanism.
  pxKeyframes: `
    @keyframes dsg-drift-a{0%{transform:translate3d(0,0,0)}50%{transform:translate3d(-99.84px,-43.2px,0)}100%{transform:translate3d(-30.72px,-17.28px,0)}}
    @keyframes dsg-drift-b{0%{transform:translate3d(0,0,0)}50%{transform:translate3d(107.52px,43.2px,0)}100%{transform:translate3d(30.72px,-17.28px,0)}}
    @keyframes dsg-drift-c{0%{transform:translate3d(0,0,0)}50%{transform:translate3d(61.44px,-25.92px,0)}100%{transform:translate3d(-61.44px,25.92px,0)}}
    @keyframes dsg-drift-d{0%{transform:translate3d(0,0,0)}50%{transform:translate3d(-38.4px,17.28px,0)}100%{transform:translate3d(30.72px,-17.28px,0)}}
    @keyframes dsg-fx-a{0%{transform:translate3d(0,0,0) scale(1)}100%{transform:translate3d(870.4px,614.4px,0) scale(1.24)}}
    @keyframes dsg-fx-b{0%{transform:translate3d(0,0,0) scale(1.02)}100%{transform:translate3d(-768px,665.6px,0) scale(1.2) rotate(14deg)}}
    @keyframes dsg-fx-c{0%{transform:translate3d(0,0,0) scale(1)}100%{transform:translate3d(665.6px,-768px,0) scale(1.22)}}
    @keyframes dsg-fx-d{0%{transform:translate3d(0,0,0) scale(1.1) rotate(0)}100%{transform:translate3d(-665.6px,563.2px,0) scale(1.28) rotate(-12deg)}}
    @keyframes dsg-cyber-sway{0%{transform:translate3d(-44.55px,16.56px,0) scale(1.03)}100%{transform:translate3d(74.25px,-24.84px,0) scale(1.07)}}
  `,
}

function withDiagnostics(base, kind) {
  return (options) => {
    const handle = base(options)
    const style = addOverride(DIAGNOSTIC_CSS[kind])
    const destroy = handle.destroy.bind(handle)
    handle.destroy = () => {
      style.remove()
      destroy()
    }
    return handle
  }
}

/* ------------------------------------------------------------------ */
/* production: the shipped `src/client/effects/ambient.js` renderer     */
/* ------------------------------------------------------------------ */

/**
 * Mount the actual production implementation. The winner of the bake-off is
 * kept in `src/client`; this variant keeps the benchmark honest by measuring
 * exactly that code instead of a bench twin.
 */
function mountProduction({ fxParent, caps = TEXTURE_CAP }) {
  const stack = mountAuroraStack({ caps })
  const gel = mountGelLayer({ caps })
  const fx = document.createElement('div')
  fx.className = 'dsg-fx'
  fx.setAttribute('aria-hidden', 'true')
  for (const id of BLOB_IDS) {
    const canvas = document.createElement('canvas')
    canvas.className = `dsg-fxBlob dsg-fxBlob${id}`
    fx.append(canvas)
  }
  fxParent.append(fx)
  const blobs = bakeBlobs(fx, { caps })

  const base = stack.root.querySelector('.dsg-auroraBase')
  for (const node of [base, ...Object.values(stack.layers), gel.canvas, ...fx.children]) {
    if (node) markTexture(node, node.width, node.height)
  }

  return {
    id: caps === TEXTURE_CAP ? 'production' : `production@${caps.layer}`,
    seek: seekCss,
    resume: resumeCss,
    destroy() {
      blobs.dispose()
      gel.dispose()
      stack.dispose()
      fx.remove()
    },
  }
}

const spriteScreen = (options) => mountSprite({ ...options, blobBlend: 'screen', capScale: 1 })

const FACTORIES = {
  baseline: mountBaseline,
  production: (options) => mountProduction(options),
  productionTiny: (options) => mountProduction({ ...options, caps: { base: 320, layer: 192, blob: 256, gel: 440 } }),
  productionMicro: (options) => mountProduction({ ...options, caps: { base: 160, layer: 96, blob: 128, gel: 220 } }),
  productionNano: (options) => mountProduction({ ...options, caps: { base: 80, layer: 48, blob: 64, gel: 110 } }),
  productionPico: (options) => mountProduction({ ...options, caps: { base: 40, layer: 24, blob: 32, gel: 55 } }),
  productionLight: withDiagnostics(mountProduction, 'lightBlend'),
  sprite: (options) => mountSprite({ ...options, blobBlend: 'screen', capScale: 1 }),
  spriteTiny: (options) => mountSprite({ ...options, blobBlend: 'screen', capScale: 0.5 }),
  spriteLight: (options) => mountSprite({ ...options, blobBlend: 'plus-lighter', capScale: 1 }),
  canvas: (options) => createCanvasEngine({ ...options, blobBlend: 'screen', backMode: 'canvas' }),
  canvasLight: (options) => createCanvasEngine({ ...options, blobBlend: 'plus-lighter', backMode: 'canvas' }),
  hybrid: (options) => createCanvasEngine({ ...options, blobBlend: 'screen', backMode: 'sprite' }),
  dBaseNoAnim: withDiagnostics(mountBaseline, 'noAnim'),
  dSpriteNoAnim: withDiagnostics(spriteScreen, 'noAnim'),
  dBaseNoBlend: withDiagnostics(mountBaseline, 'noBlend'),
  dSpriteNoBlend: withDiagnostics(spriteScreen, 'noBlend'),
  spriteMicro: (options) => mountSprite({ ...options, blobBlend: 'screen', capScale: 0.25 }),
  dSpriteNoWill: withDiagnostics(spriteScreen, 'noWill'),
  dBaseNoGel: withDiagnostics(mountBaseline, 'noGel'),
  dSpriteNoGel: withDiagnostics(spriteScreen, 'noGel'),
  dBaseNoFx: withDiagnostics(mountBaseline, 'noFx'),
  dSpriteNoFx: withDiagnostics(spriteScreen, 'noFx'),
  dBaseNoLayers: withDiagnostics(mountBaseline, 'noLayers'),
  dSpriteNoLayers: withDiagnostics(spriteScreen, 'noLayers'),
  dBaseNoMask: withDiagnostics(mountBaseline, 'noMask'),
  dBaseOnlyDrifts: withDiagnostics(mountBaseline, 'onlyDrifts'),
  dBaseOnlyGelFx: withDiagnostics(mountBaseline, 'onlyGelFx'),
  dBasePx: withDiagnostics(mountBaseline, 'pxKeyframes'),
  dBaseDriftsNoWill: withDiagnostics(
    withDiagnostics(mountBaseline, 'onlyDrifts'),
    'noWill',
  ),
  dBaseNoWill: withDiagnostics(mountBaseline, 'noWill'),
  native: () => ({ id: 'native', seek() {}, resume() {}, destroy() {} }),
  dBaseWaapi: (options) => {
    // Same motion, but driven by WAAPI instead of CSS animations: tests
    // whether Blink's per-frame main-thread ticking is CSS-animation-specific.
    const handle = withDiagnostics(mountBaseline, 'noAnim')(options)
    const spec = [
      ['.dsg-aurora-a', 26000, [{ transform: 'translate3d(0,0,0)' }, { transform: 'translate3d(-3.9vw,-3vh,0)', offset: 0.5 }, { transform: 'translate3d(-1.2vw,-1.2vh,0)' }]],
      ['.dsg-aurora-b', 26000, [{ transform: 'translate3d(0,0,0)' }, { transform: 'translate3d(4.2vw,3vh,0)', offset: 0.5 }, { transform: 'translate3d(1.2vw,-1.2vh,0)' }]],
      ['.dsg-aurora-c', 26000, [{ transform: 'translate3d(0,0,0)' }, { transform: 'translate3d(2.4vw,-1.8vh,0)', offset: 0.5 }, { transform: 'translate3d(-2.4vw,1.8vh,0)' }]],
      ['.dsg-aurora-d', 26000, [{ transform: 'translate3d(0,0,0)' }, { transform: 'translate3d(-1.5vw,1.2vh,0)', offset: 0.5 }, { transform: 'translate3d(1.2vw,-1.2vh,0)' }]],
      ['.dsg-fxBlobA', 11000, [{ transform: 'translate3d(0,0,0) scale(1)' }, { transform: 'translate3d(34vmax,24vmax,0) scale(1.24)' }]],
      ['.dsg-fxBlobB', 14000, [{ transform: 'translate3d(0,0,0) scale(1.02)' }, { transform: 'translate3d(-30vmax,26vmax,0) scale(1.2) rotate(14deg)' }]],
      ['.dsg-fxBlobC', 17000, [{ transform: 'translate3d(0,0,0) scale(1)' }, { transform: 'translate3d(26vmax,-30vmax,0) scale(1.22)' }]],
      ['.dsg-fxBlobD', 13000, [{ transform: 'translate3d(0,0,0) scale(1.1) rotate(0)' }, { transform: 'translate3d(-26vmax,22vmax,0) scale(1.28) rotate(-12deg)' }]],
    ]
    const animations = []
    for (const [selector, duration, keyframes] of spec) {
      const el = document.querySelector(selector)
      if (el) animations.push(el.animate(keyframes, { duration, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out', fill: 'both' }))
    }
    const gel = document.querySelector('.dsg-gel') ?? document.body
    animations.push(
      gel.animate([{ opacity: 0.38 }, { opacity: 0.72 }], { duration: 12000, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out', fill: 'both' }),
      gel.animate(
        [{ transform: 'translate3d(-1.5%,1%,0) scale(1.03)' }, { transform: 'translate3d(2.5%,-1.5%,0) scale(1.07)' }],
        { duration: 28000, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out', fill: 'both' },
      ),
    )
    const destroy = handle.destroy.bind(handle)
    handle.destroy = () => {
      for (const anim of animations) anim.cancel()
      destroy()
    }
    return handle
  },
}

export const VARIANT_IDS = Object.keys(FACTORIES)

/** Mount one variant on the bench page; replaces any previous mount. */
export function mountVariant(id, { theme }) {
  const factory = FACTORIES[id]
  if (factory === undefined) throw new Error(`bench: unknown variant "${id}"`)
  document.querySelectorAll('[data-bench-override]').forEach((node) => node.remove())
  document.body.setAttribute('data-bench-variant', id)
  return factory({ theme, fxParent: document.getElementById('fxmount') })
}

/**
 * Canvas-sprite ambient renderer for the cyber preset.
 *
 * Every ambient gradient piece becomes a `<canvas>` that IS its compositor
 * texture: the backing store is a small bake of the gradient, the element is
 * stretched to its CSS box by the unchanged style rules, and the existing
 * CSS keyframes keep driving the motion on the compositor. Result: identical
 * visuals and motion with textures a fraction of the full-resolution raster.
 *
 * Only the gel (absolute px gradient radii) needs a re-bake on resize; every
 * other gradient is box-relative and stretches correctly by itself.
 */
import {
  AURORA_BASE,
  AURORA_GRADIENTS,
  BLOB_GRADIENTS,
  GEL_GRADIENTS,
  TEXTURE_CAP,
  backingScale,
  bake,
  paintBase,
  paintGradient,
} from './gradients.js'

/** Current host colour scheme, mirrored from `body[data-ds-dark-theme]`. */
export function currentTheme() {
  return document.body.hasAttribute('data-ds-dark-theme') ? 'dark' : 'light'
}

/** Run `callback` whenever the host switches colour scheme. */
export function observeTheme(callback) {
  const observer = new MutationObserver(() => callback(currentTheme()))
  observer.observe(document.body, { attributes: true, attributeFilter: ['data-ds-dark-theme'] })
  return {
    dispose() {
      observer.disconnect()
    },
  }
}

/** Debounce helper for resize work. */
function debounce(fn, ms) {
  let timer = 0
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}

/**
 * Mount the aurora background stack: a fixed root carrying the static base
 * canvas plus one drifting canvas per gradient layer. Class names and CSS
 * geometry/animations are unchanged from the pure-CSS implementation.
 */
export function mountAuroraStack({ caps = TEXTURE_CAP } = {}) {
  const root = document.createElement('div')
  root.className = 'dsg-aurora'
  root.setAttribute('aria-hidden', 'true')

  const base = document.createElement('canvas')
  base.className = 'dsg-auroraBase'
  base.style.cssText = 'position:absolute;inset:0;width:100%;height:100%'
  root.append(base)

  const layers = {}
  for (const id of ['a', 'b', 'c', 'd']) {
    const canvas = document.createElement('canvas')
    canvas.className = `dsg-auroraLayer dsg-aurora-${id}`
    root.append(canvas)
    layers[id] = canvas
  }
  document.body.append(root)

  function backingFor(kind, element) {
    const rect = element.getBoundingClientRect()
    const scale = backingScale(kind, rect.width, rect.height, caps)
    return { w: Math.max(1, Math.round(rect.width * scale)), h: Math.max(1, Math.round(rect.height * scale)) }
  }

  function repaint(theme) {
    let size = backingFor('base', base)
    base.width = size.w
    base.height = size.h
    paintBase(base.getContext('2d'), size.w, size.h, AURORA_BASE[theme])
    for (const [id, canvas] of Object.entries(layers)) {
      size = backingFor('layer', canvas)
      canvas.width = size.w
      canvas.height = size.h
      bakeInto(canvas, AURORA_GRADIENTS[id][theme])
    }
  }

  const theme = observeTheme(repaint)
  repaint(currentTheme())

  return {
    root,
    layers,
    repaint,
    dispose() {
      theme.dispose()
      root.remove()
    },
  }
}

/** Paint one gradient spec into an existing canvas's backing store. */
function bakeInto(canvas, spec) {
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  paintGradient(ctx, canvas.width, canvas.height, spec)
}

/**
 * Mount the gel overlay as a real element replacing the old `body::after`
 * pseudo-element (a pseudo cannot host a canvas). CSS keeps the blend mode
 * and the pulse/sway animations; only the pixels are baked.
 */
export function mountGelLayer({ caps = TEXTURE_CAP } = {}) {
  const canvas = document.createElement('canvas')
  canvas.className = 'dsg-gel'
  canvas.setAttribute('aria-hidden', 'true')
  document.body.append(canvas)

  function repaint(theme) {
    // The gel box is 116% of the viewport (CSS `left/top:-8%;width/height:116%`).
    // Percentages resolve against the initial containing block, which excludes
    // classic scrollbars — use clientWidth/clientHeight to match exactly.
    const box = {
      w: (document.documentElement?.clientWidth || window.innerWidth) * 1.16,
      h: (document.documentElement?.clientHeight || window.innerHeight) * 1.16,
    }
    const scale = backingScale('gel', box.w, box.h, caps)
    canvas.width = Math.max(1, Math.round(box.w * scale))
    canvas.height = Math.max(1, Math.round(box.h * scale))
    const ctx = canvas.getContext('2d')
    for (const spec of GEL_GRADIENTS[theme]) {
      // CSS radii are absolute px on this box; convert to backing fractions.
      paintGradient(ctx, canvas.width, canvas.height, {
        ...spec,
        rx: (spec.rx / box.w) * canvas.width,
        ry: (spec.ry / box.h) * canvas.height,
      })
    }
  }

  const theme = observeTheme(repaint)
  const onResize = debounce(() => repaint(currentTheme()), 200)
  window.addEventListener('resize', onResize)
  repaint(currentTheme())

  return {
    canvas,
    repaint,
    dispose() {
      theme.dispose()
      window.removeEventListener('resize', onResize)
      canvas.remove()
    },
  }
}

/**
 * Bake the FX blob canvases that `StyleFx` renders. Blob gradients are
 * box-relative, so no resize re-bake is needed.
 */
export function bakeBlobs(container, { caps = TEXTURE_CAP } = {}) {
  const blobs = [...container.querySelectorAll('.dsg-fxBlob')]

  function repaint(theme) {
    for (const canvas of blobs) {
      const id = canvas.className.match(/dsg-fxBlob([A-D])/)?.[1]
      const spec = BLOB_GRADIENTS[id]
      if (spec === undefined) continue
      const rect = canvas.getBoundingClientRect()
      const scale = backingScale('blob', rect.width, rect.height, caps)
      canvas.width = Math.max(1, Math.round(rect.width * scale))
      canvas.height = Math.max(1, Math.round(rect.height * scale))
      bakeInto(canvas, spec)
    }
  }

  const theme = observeTheme(repaint)
  repaint(currentTheme())
  return {
    repaint,
    dispose() {
      theme.dispose()
    },
  }
}

/** Convenience for tests/bench: bake one spec into a detached canvas. */
export function bakeSprite(spec, cssWidth, cssHeight, kind, caps = TEXTURE_CAP) {
  const scale = backingScale(kind, cssWidth, cssHeight, caps)
  return bake(spec, cssWidth * scale, cssHeight * scale, kind === 'base' ? paintBase : undefined)
}

/**
 * Ambient gradient specs and bakers for the cyber preset.
 *
 * These specs mirror the gradient images the style layer used to paint as
 * CSS `image()` values; each `css` field keeps the exact historical literal
 * (also preserved in `presets/cyber/style.css` next to the geometry) so the
 * visual identity stays reviewable and machine-checkable.
 *
 * CSS interpolates gradient stops premultiplied while Canvas2D interpolates
 * straight, so `expandStops` folds each segment into dense stops whose
 * straight interpolation reproduces the premultiplied curve. That is what
 * makes a baked canvas pixel-faithful to the CSS raster.
 */

/**
 * Aurora background layers `.dsg-aurora-a..d`: `radial-gradient(closest-side,
 * <color>, transparent)` — an ellipse filling the element box.
 */
export const AURORA_GRADIENTS = {
  a: {
    light: { css: 'radial-gradient(closest-side,rgba(124,58,237,.55),transparent)', shape: 'ellipse', cx: 0.5, cy: 0.5, rx: 0.5, ry: 0.5, stops: [[0, [124, 58, 237, 0.55]], [1, [0, 0, 0, 0]]] },
    dark: { css: 'radial-gradient(closest-side,rgba(34,211,238,.6),transparent)', shape: 'ellipse', cx: 0.5, cy: 0.5, rx: 0.5, ry: 0.5, stops: [[0, [34, 211, 238, 0.6]], [1, [0, 0, 0, 0]]] },
  },
  b: {
    light: { css: 'radial-gradient(closest-side,rgba(34,211,238,.5),transparent)', shape: 'ellipse', cx: 0.5, cy: 0.5, rx: 0.5, ry: 0.5, stops: [[0, [34, 211, 238, 0.5]], [1, [0, 0, 0, 0]]] },
    dark: { css: 'radial-gradient(closest-side,rgba(168,85,247,.55),transparent)', shape: 'ellipse', cx: 0.5, cy: 0.5, rx: 0.5, ry: 0.5, stops: [[0, [168, 85, 247, 0.55]], [1, [0, 0, 0, 0]]] },
  },
  c: {
    light: { css: 'radial-gradient(closest-side,rgba(236,72,153,.35),transparent)', shape: 'ellipse', cx: 0.5, cy: 0.5, rx: 0.5, ry: 0.5, stops: [[0, [236, 72, 153, 0.35]], [1, [0, 0, 0, 0]]] },
    dark: { css: 'radial-gradient(closest-side,rgba(59,130,246,.5),transparent)', shape: 'ellipse', cx: 0.5, cy: 0.5, rx: 0.5, ry: 0.5, stops: [[0, [59, 130, 246, 0.5]], [1, [0, 0, 0, 0]]] },
  },
  d: {
    light: { css: 'radial-gradient(closest-side,rgba(124,58,237,.14),transparent)', shape: 'ellipse', cx: 0.5, cy: 0.5, rx: 0.5, ry: 0.5, stops: [[0, [124, 58, 237, 0.14]], [1, [0, 0, 0, 0]]] },
    dark: { css: 'radial-gradient(closest-side,rgba(236,72,153,.18),transparent)', shape: 'ellipse', cx: 0.5, cy: 0.5, rx: 0.5, ry: 0.5, stops: [[0, [236, 72, 153, 0.18]], [1, [0, 0, 0, 0]]] },
  },
}

/** Aurora base (`.dsg-aurora` background): 160%-sized centred linear gradient. */
export const AURORA_BASE = {
  light: {
    css: 'linear-gradient(155deg,#eef2ff 0%,#e6f8ff 48%,#f7edff 100%)',
    angle: 155,
    stops: [[0, [238, 242, 255, 1]], [0.48, [230, 248, 255, 1]], [1, [247, 237, 255, 1]]],
  },
  dark: {
    css: 'linear-gradient(160deg,#03040b 0%,#070a1c 45%,#0a0d26 100%)',
    angle: 160,
    stops: [[0, [3, 4, 11, 1]], [0.45, [7, 10, 28, 1]], [1, [10, 13, 38, 1]]],
  },
}

/**
 * FX blobs `.dsg-fxBlobA..D`: `radial-gradient(circle at x y, ...)` with the
 * implicit farthest-corner radius.
 */
export const BLOB_GRADIENTS = {
  A: { css: 'radial-gradient(circle at 42% 42%,rgba(168,85,247,.7),rgba(59,130,246,.2) 46%,transparent 68%)', shape: 'circle', cx: 0.42, cy: 0.42, stops: [[0, [168, 85, 247, 0.7]], [0.46, [59, 130, 246, 0.2]], [0.68, [0, 0, 0, 0]]] },
  B: { css: 'radial-gradient(circle at 58% 42%,rgba(34,211,238,.7),rgba(59,130,246,.22) 46%,transparent 68%)', shape: 'circle', cx: 0.58, cy: 0.42, stops: [[0, [34, 211, 238, 0.7]], [0.46, [59, 130, 246, 0.22]], [0.68, [0, 0, 0, 0]]] },
  C: { css: 'radial-gradient(circle at 50% 50%,rgba(236,72,153,.6),rgba(124,58,237,.22) 48%,transparent 70%)', shape: 'circle', cx: 0.5, cy: 0.5, stops: [[0, [236, 72, 153, 0.6]], [0.48, [124, 58, 237, 0.22]], [0.7, [0, 0, 0, 0]]] },
  D: { css: 'radial-gradient(circle at 50% 50%,rgba(59,130,246,.55),rgba(34,211,238,.2) 44%,transparent 68%)', shape: 'circle', cx: 0.5, cy: 0.5, stops: [[0, [59, 130, 246, 0.55]], [0.44, [34, 211, 238, 0.2]], [0.68, [0, 0, 0, 0]]] },
}

/** The gel overlay (`body::after`): three sized radial gradients per scheme. */
export const GEL_GRADIENTS = {
  light: [
    { css: 'radial-gradient(900px 700px at 86% -4%,rgba(124,58,237,.22),transparent 58%)', shape: 'ellipse', cx: 0.86, cy: -0.04, rx: 900, ry: 700, stops: [[0, [124, 58, 237, 0.22]], [0.58, [0, 0, 0, 0]]] },
    { css: 'radial-gradient(800px 600px at 4% 10%,rgba(34,211,238,.2),transparent 60%)', shape: 'ellipse', cx: 0.04, cy: 0.1, rx: 800, ry: 600, stops: [[0, [34, 211, 238, 0.2]], [0.6, [0, 0, 0, 0]]] },
    { css: 'radial-gradient(900px 700px at 50% 116%,rgba(236,72,153,.14),transparent 62%)', shape: 'ellipse', cx: 0.5, cy: 1.16, rx: 900, ry: 700, stops: [[0, [236, 72, 153, 0.14]], [0.62, [0, 0, 0, 0]]] },
  ],
  dark: [
    { css: 'radial-gradient(900px 700px at 86% -4%,rgba(34,211,238,.26),transparent 58%)', shape: 'ellipse', cx: 0.86, cy: -0.04, rx: 900, ry: 700, stops: [[0, [34, 211, 238, 0.26]], [0.58, [0, 0, 0, 0]]] },
    { css: 'radial-gradient(800px 600px at 4% 10%,rgba(168,85,247,.24),transparent 60%)', shape: 'ellipse', cx: 0.04, cy: 0.1, rx: 800, ry: 600, stops: [[0, [168, 85, 247, 0.24]], [0.6, [0, 0, 0, 0]]] },
    { css: 'radial-gradient(900px 700px at 50% 116%,rgba(59,130,246,.2),transparent 62%)', shape: 'ellipse', cx: 0.5, cy: 1.16, rx: 900, ry: 700, stops: [[0, [59, 130, 246, 0.2]], [0.62, [0, 0, 0, 0]]] },
  ],
}

/**
 * Backing-store caps in CSS pixels. Ambient gradients are low-frequency, so
 * a bounded canvas scaled up by the compositor is visually indistinguishable
 * from a full-resolution raster while keeping textures tiny. The caps are
 * bench-gated against the full-resolution CSS raster at 2560x1440@1.5 and a
 * 4K viewport: nano passes with max channel delta <= 6, while the next tier
 * down (pico, half of nano) starts slipping (dark max delta 9). See
 * docs/aurora-render-perf-results.md.
 */
export const TEXTURE_CAP = { base: 80, layer: 48, blob: 64, gel: 110 }

function rgbaCss([r, g, b, a]) {
  return `rgba(${r},${g},${b},${a})`
}

/**
 * Expand each stop segment into dense stops whose straight interpolation
 * matches the premultiplied interpolation CSS uses (the classic dark-halo
 * divergence on `-> transparent`).
 */
export function expandStops(stops, perSegment = 24) {
  const out = []
  for (let i = 0; i < stops.length - 1; i++) {
    const [t0, [r0, g0, b0, a0]] = stops[i]
    const [t1, [r1, g1, b1, a1]] = stops[i + 1]
    for (let k = 0; k < perSegment; k++) {
      const t = k / perSegment
      const a = a0 + (a1 - a0) * t
      const r = a === 0 ? r1 : (r0 * a0 + (r1 * a1 - r0 * a0) * t) / a
      const g = a === 0 ? g1 : (g0 * a0 + (g1 * a1 - g0 * a0) * t) / a
      const b = a === 0 ? b1 : (b0 * a0 + (b1 * a1 - b0 * a0) * t) / a
      out.push([t0 + (t1 - t0) * t, [Math.round(r), Math.round(g), Math.round(b), a]])
    }
  }
  out.push(stops[stops.length - 1])
  return out
}

/**
 * Paint one radial spec onto a 2D context at backing resolution.
 * `w`/`h` are the backing pixels of the whole element box.
 *
 *   shape 'ellipse'  semi-axes `rx`/`ry` as fractions of the box (<=1) or px
 *   shape 'circle'   `cx`/`cy` positioned, farthest-corner radius
 */
export function paintGradient(ctx, w, h, spec) {
  const cx = spec.cx * w
  const cy = spec.cy * h
  let radius
  let scaleX = 1
  let scaleY = 1
  if (spec.shape === 'circle') {
    radius = Math.max(
      Math.hypot(cx, cy),
      Math.hypot(w - cx, cy),
      Math.hypot(cx, h - cy),
      Math.hypot(w - cx, h - cy),
    )
  } else {
    const rx = spec.rx <= 1 ? spec.rx * w : spec.rx
    const ry = spec.ry <= 1 ? spec.ry * h : spec.ry
    // Semi-axes are rx/ry; any circle radius works since the transform
    // scales the gradient along, so pick the smaller axis.
    radius = Math.max(1, Math.min(rx, ry))
    scaleX = rx / radius
    scaleY = ry / radius
  }
  ctx.save()
  if (scaleX !== 1 || scaleY !== 1) {
    ctx.translate(cx, cy)
    ctx.scale(scaleX, scaleY)
    ctx.translate(-cx, -cy)
  }
  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
  for (const [t, rgba] of expandStops(spec.stops)) gradient.addColorStop(t, rgbaCss(rgba))
  ctx.fillStyle = gradient
  ctx.fillRect(-w, -h, w * 3, h * 3)
  ctx.restore()
}

/**
 * Paint the aurora base. The CSS background is a 160%x160% centred linear
 * gradient clipped by the element box, so the visible region samples the
 * middle 62.5% of the virtual gradient image.
 */
export function paintBase(ctx, w, h, spec) {
  const imageW = w * 1.6
  const imageH = h * 1.6
  const rad = ((spec.angle % 360) * Math.PI) / 180
  const sin = Math.sin(rad)
  const cos = Math.cos(rad)
  const lineLen = Math.abs(imageW * sin) + Math.abs(imageH * cos)
  const gx = imageW / 2
  const gy = imageH / 2
  const gradient = ctx.createLinearGradient(
    gx - (sin * lineLen) / 2,
    gy + (cos * lineLen) / 2,
    gx + (sin * lineLen) / 2,
    gy - (cos * lineLen) / 2,
  )
  for (const [t, [r, g, b]] of spec.stops) gradient.addColorStop(t, `rgb(${r},${g},${b})`)
  ctx.save()
  ctx.translate((w - imageW) / 2, (h - imageH) / 2)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, imageW, imageH)
  ctx.restore()
}

/** Bake one spec into a fresh canvas of the requested backing size. */
export function bake(spec, w, h, painter = paintGradient) {
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(w))
  canvas.height = Math.max(1, Math.round(h))
  painter(canvas.getContext('2d'), canvas.width, canvas.height, spec)
  return canvas
}

/** Backing scale for one piece: capped, never upscaled past CSS pixels. */
export function backingScale(kind, cssWidth, cssHeight, cap = TEXTURE_CAP) {
  return Math.min(1, cap[kind] / Math.max(cssWidth, cssHeight))
}

/**
 * Browser-side gradient helpers for the benchmark page.
 *
 * The specs and painters live in the production module (`src/client/
 * effects/gradients.js`) — the bench measures exactly what ships. This file
 * adds bench-only utilities: named bake helpers, the FX mask ramp and its
 * texture.
 */
export * from '/src/effects/gradients.js'

import { bake, paintBase } from '/src/effects/gradients.js'

/** Bake the aurora base into a fresh canvas. */
export const bakeBase = (spec, w, h) => bake(spec, w, h, paintBase)

/** Bake one radial spec into a fresh canvas. */
export const bakeRadial = (spec, w, h) => bake(spec, w, h)

/** The vertical fade baked into the FX group by `.dsg-fx`'s mask-image. */
export const FX_MASK = { css: 'linear-gradient(to bottom,#000 0%,#000 68%,transparent 94%)', stops: [[0, 1], [0.68, 1], [0.94, 0]] }

/** Vertical mask ramp value at `t` in [0,1] (mirrors FX_MASK). */
export function maskRamp(t) {
  const stops = FX_MASK.stops
  for (let i = 1; i < stops.length; i++) {
    const [t0, v0] = stops[i - 1]
    const [t1, v1] = stops[i]
    if (t <= t1) return v0 + ((v1 - v0) * (t - t0)) / (t1 - t0)
  }
  return stops[stops.length - 1][1]
}

/** Bake the FX bottom fade into a narrow canvas (GL/Canvas2D mask texture). */
export function bakeMask(w, h) {
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(w))
  canvas.height = Math.max(1, Math.round(h))
  const ctx = canvas.getContext('2d')
  const image = ctx.createImageData(canvas.width, canvas.height)
  for (let y = 0; y < canvas.height; y++) {
    const value = Math.round(maskRamp(y / (canvas.height - 1)) * 255)
    for (let x = 0; x < canvas.width; x++) {
      const index = (y * canvas.width + x) * 4
      image.data[index] = 255
      image.data[index + 1] = 255
      image.data[index + 2] = 255
      image.data[index + 3] = value
    }
  }
  ctx.putImageData(image, 0, 0)
  return canvas
}

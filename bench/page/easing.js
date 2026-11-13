/**
 * Exact replication of the CSS animation timelines used by the aurora theme.
 *
 * `animation-timing-function` applies per keyframe interval, animations are
 * `infinite alternate`, and keyframe values carry vw/vh/vmax units. The
 * WebGL variant drives its quads from this module so its motion is the same
 * function of time as the CSS animations it replaces.
 */

/** Solve a cubic-bezier(x1,y1,x2,y2) timing function for progress `t`. */
export function cubicBezier(x1, y1, x2, y2) {
  const cx = 3 * x1
  const bx = 3 * (x2 - x1) - cx
  const ax = 1 - cx - bx
  const cy = 3 * y1
  const by = 3 * (y2 - y1) - cy
  const ay = 1 - cy - by
  const sampleX = (t) => ((ax * t + bx) * t + cx) * t
  const sampleY = (t) => ((ay * t + by) * t + cy) * t
  const sampleDX = (t) => (3 * ax * t + 2 * bx) * t + cx
  return (x) => {
    if (x <= 0) return 0
    if (x >= 1) return 1
    let t = x
    for (let i = 0; i < 8; i++) {
      const error = sampleX(t) - x
      if (Math.abs(error) < 1e-6) return sampleY(t)
      const dx = sampleDX(t)
      if (Math.abs(dx) < 1e-6) break
      t -= error / dx
    }
    let lo = 0
    let hi = 1
    t = x
    for (let i = 0; i < 24; i++) {
      const value = sampleX(t)
      if (Math.abs(value - x) < 1e-6) break
      if (value > x) hi = t
      else lo = t
      t = (lo + hi) / 2
    }
    return sampleY(t)
  }
}

/** CSS `ease-in-out`, used by every aurora animation. */
export const easeInOut = cubicBezier(0.42, 0, 0.58, 1)

/**
 * One CSS keyframe animation.
 *
 * @typedef {Object} AnimationSpec
 * @property {number} durationMs
 * @property {Array<[number, object]>} keyframes  offset -> value bag
 */

/**
 * Evaluate an `infinite alternate` animation at absolute time `tMs`.
 * Values are objects of numeric fields interpolated per keyframe interval;
 * `ease-in-out` is applied inside every interval, exactly like CSS.
 */
export function evaluateAnimation(spec, tMs) {
  const { durationMs, keyframes } = spec
  const cycle = Math.floor(tMs / durationMs)
  let phase = (tMs % durationMs) / durationMs
  const reversed = cycle % 2 === 1
  if (reversed) phase = 1 - phase
  let from = keyframes[0]
  let to = keyframes[keyframes.length - 1]
  for (let i = 1; i < keyframes.length; i++) {
    if (phase <= keyframes[i][0]) {
      from = keyframes[i - 1]
      to = keyframes[i]
      break
    }
  }
  const span = to[0] - from[0]
  const local = span === 0 ? 0 : easeInOut((phase - from[0]) / span)
  const out = {}
  for (const key of Object.keys(from[1])) {
    const a = from[1][key]
    const b = to[1][key] ?? a
    out[key] = a + (b - a) * local
  }
  return out
}

/**
 * Transform specs of every animated ambient layer, mirrored from
 * `src/client/presets/cyber/style.css` and `src/client/styles/page.css`.
 * Translation values are in viewport fractions (`vw`/`vh`/`vmax` == px/100).
 */
export const ANIMATIONS = {
  // style.css @keyframes dsg-drift-a..d — 26s, translate3d in vw/vh.
  'dsg-drift-a': { durationMs: 26000, keyframes: [[0, { x: 0, y: 0, s: 1, r: 0 }], [0.5, { x: -3.9 / 100, y: -3 / 100, s: 1, r: 0 }], [1, { x: -1.2 / 100, y: -1.2 / 100, s: 1, r: 0 }]] },
  'dsg-drift-b': { durationMs: 26000, keyframes: [[0, { x: 0, y: 0, s: 1, r: 0 }], [0.5, { x: 4.2 / 100, y: 3 / 100, s: 1, r: 0 }], [1, { x: 1.2 / 100, y: -1.2 / 100, s: 1, r: 0 }]] },
  'dsg-drift-c': { durationMs: 26000, keyframes: [[0, { x: 0, y: 0, s: 1, r: 0 }], [0.5, { x: 2.4 / 100, y: -1.8 / 100, s: 1, r: 0 }], [1, { x: -2.4 / 100, y: 1.8 / 100, s: 1, r: 0 }]] },
  'dsg-drift-d': { durationMs: 26000, keyframes: [[0, { x: 0, y: 0, s: 1, r: 0 }], [0.5, { x: -1.5 / 100, y: 1.2 / 100, s: 1, r: 0 }], [1, { x: 1.2 / 100, y: -1.2 / 100, s: 1, r: 0 }]] },
  // page.css @keyframes dsg-fx-a..d — translate3d + scale (+rotate) in vmax.
  'dsg-fx-a': { durationMs: 11000, keyframes: [[0, { x: 0, y: 0, s: 1, r: 0 }], [1, { x: 34 / 100, y: 24 / 100, s: 1.24, r: 0 }]] },
  'dsg-fx-b': { durationMs: 14000, keyframes: [[0, { x: 0, y: 0, s: 1.02, r: 0 }], [1, { x: -30 / 100, y: 26 / 100, s: 1.2, r: 14 }]] },
  'dsg-fx-c': { durationMs: 17000, keyframes: [[0, { x: 0, y: 0, s: 1, r: 0 }], [1, { x: 26 / 100, y: -30 / 100, s: 1.22, r: 0 }]] },
  'dsg-fx-d': { durationMs: 13000, keyframes: [[0, { x: 0, y: 0, s: 1.1, r: 0 }], [1, { x: -26 / 100, y: 22 / 100, s: 1.28, r: -12 }]] },
  // style.css @keyframes dsg-cyber-pulse / dsg-cyber-sway — gel opacity/transform.
  'dsg-cyber-pulse': { durationMs: 12000, keyframes: [[0, { opacity: 0.38 }], [1, { opacity: 0.72 }]] },
  'dsg-cyber-sway': { durationMs: 28000, keyframes: [[0, { x: -1.5 / 100, y: 1 / 100, s: 1.03, r: 0 }], [1, { x: 2.5 / 100, y: -1.5 / 100, s: 1.07, r: 0 }]] },
}

/** Which animation drives which ambient element. */
export const LAYER_ANIMATIONS = {
  'aurora-a': 'dsg-drift-a',
  'aurora-b': 'dsg-drift-b',
  'aurora-c': 'dsg-drift-c',
  'aurora-d': 'dsg-drift-d',
  'blob-a': 'dsg-fx-a',
  'blob-b': 'dsg-fx-b',
  'blob-c': 'dsg-fx-c',
  'blob-d': 'dsg-fx-d',
  gel: 'dsg-cyber-sway',
}

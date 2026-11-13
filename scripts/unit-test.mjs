/**
 * Unit tests for the pure gradient math in `src/client/effects/gradients.js`.
 * These lock the two fidelity-critical behaviours:
 *
 *   1. stop expansion reproduces CSS's premultiplied interpolation;
 *   2. backing-store scaling caps textures without upscaled bakes.
 */
import assert from 'node:assert/strict'
import { TEXTURE_CAP, backingScale, expandStops } from '../src/client/effects/gradients.js'

// --- 1. premultiplied expansion -------------------------------------

{
  // `c .5 -> transparent` must fade alpha linearly while holding the colour,
  // exactly like CSS premultiplied interpolation (not toward black).
  const stops = expandStops([[0, [10, 20, 30, 0.5]], [1, [0, 0, 0, 0]]])
  assert.equal(stops.length, 25, 'two-stop segments expand to perSegment + 1 stops')
  const mid = stops[12]
  assert.ok(Math.abs(mid[0] - 0.5) < 1e-9, 'stop positions stay uniform')
  const [r, g, b, a] = mid[1]
  assert.equal(a.toFixed(3), '0.250', 'alpha fades linearly')
  assert.deepEqual([r, g, b], [10, 20, 30], 'colour is preserved while alpha fades')
}

{
  // Between two different colours with unequal alphas, the straight
  // interpolation of the expanded stops must match the premultiplied curve.
  const stops = expandStops([[0, [10, 20, 30, 1]], [1, [200, 100, 50, 0]]])
  const mid = stops[12][1]
  assert.equal(mid[3].toFixed(3), '0.500', 'alpha interpolates linearly')
  assert.deepEqual([mid[0], mid[1], mid[2]], [10, 20, 30], 'premultiplied curve keeps r0 while a1 is zero')
}

{
  // Multi-segment lists keep every boundary and end exactly at the last stop.
  const stops = expandStops([[0, [0, 0, 0, 1]], [0.5, [255, 255, 255, 1]], [1, [0, 0, 0, 0]]])
  assert.equal(stops.length, 49, 'two segments expand to 2 x perSegment + 1 stops')
  assert.deepEqual(stops[24][1], [255, 255, 255, 1], 'segment boundary stop is preserved')
  assert.deepEqual(stops.at(-1), [1, [0, 0, 0, 0]], 'final stop lands exactly')
}

// --- 2. backing-store caps ------------------------------------------

{
  assert.ok(backingScale('blob', 2048, 2048) <= TEXTURE_CAP.blob / 2048 + 1e-9, 'large boxes shrink to the cap')
  const small = Math.min(...Object.values(TEXTURE_CAP)) / 2
  assert.equal(backingScale('layer', small, small), 1, 'boxes below every cap are never upscaled or downscaled')
  assert.equal(backingScale('gel', 1000, 500), TEXTURE_CAP.gel / 1000, 'cap scales on the longest side')
}

// --- 3. spec shape sanity -------------------------------------------

{
  const { AURORA_GRADIENTS, BLOB_GRADIENTS, GEL_GRADIENTS } = await import('../src/client/effects/gradients.js')
  for (const pair of Object.values(AURORA_GRADIENTS)) {
    for (const spec of [pair.light, pair.dark]) {
      assert.equal(spec.shape, 'ellipse')
      assert.ok(spec.stops.every(([, rgba]) => rgba.length === 4))
    }
  }
  for (const spec of Object.values(BLOB_GRADIENTS)) {
    assert.equal(spec.shape, 'circle')
    assert.ok(spec.stops[0][1][3] > 0, 'blob cores carry alpha')
  }
  for (const scheme of ['light', 'dark']) {
    assert.equal(GEL_GRADIENTS[scheme].length, 3, 'the gel keeps three radial gradients')
  }
}

console.log('unit tests passed for src/client/effects/gradients.js')

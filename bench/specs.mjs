/**
 * Gradient spec re-exports for Node-side tooling (the bench runner's
 * spec-sync check). The browser-side twin is `bench/page/gradients.js`.
 */
import {
  AURORA_BASE,
  AURORA_GRADIENTS,
  BLOB_GRADIENTS,
  GEL_GRADIENTS,
} from '../src/client/effects/gradients.js'

/** The FX group mask literal, live in `src/client/styles/page.css`. */
export const FX_MASK_CSS = 'linear-gradient(to bottom,#000 0%,#000 68%,transparent 94%)'

/** Every literal gradient substring the bench expects to find in the sources. */
export function allCssStrings() {
  const strings = []
  for (const pair of Object.values(AURORA_GRADIENTS)) {
    strings.push(pair.light.css, pair.dark.css)
  }
  strings.push(AURORA_BASE.light.css, AURORA_BASE.dark.css)
  for (const spec of Object.values(BLOB_GRADIENTS)) strings.push(spec.css)
  for (const scheme of ['light', 'dark']) {
    for (const spec of GEL_GRADIENTS[scheme]) strings.push(spec.css)
  }
  strings.push(FX_MASK_CSS)
  return strings
}

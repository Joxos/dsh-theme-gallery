import { getReact, h } from '../runtime.js'
import { bakeBlobs } from '../effects/ambient.js'

/**
 * Build the ambient overlay for the style that needs one.
 *
 * The blobs are canvases: `effects/ambient.js` bakes each radial gradient
 * into a small backing store that becomes the layer's compositor texture,
 * while the style layer keeps driving geometry and motion.
 */
export function createStyleFx({ useActiveStyle, effectStyleId }) {
  return function StyleFx() {
    const activeId = useActiveStyle()
    const React = getReact()
    const ref = React.useRef(null)
    React.useEffect(() => {
      if (activeId !== effectStyleId || ref.current === null) return undefined
      const baked = bakeBlobs(ref.current)
      return () => baked.dispose()
    }, [activeId])
    if (activeId === effectStyleId) {
      return h(
        'div',
        { className: 'dsg-fx', 'aria-hidden': 'true', ref },
        h('canvas', { className: 'dsg-fxBlob dsg-fxBlobA' }),
        h('canvas', { className: 'dsg-fxBlob dsg-fxBlobB' }),
        h('canvas', { className: 'dsg-fxBlob dsg-fxBlobC' }),
        h('canvas', { className: 'dsg-fxBlob dsg-fxBlobD' }),
      )
    }
    return null
  }
}

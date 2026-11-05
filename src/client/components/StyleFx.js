import { h } from '../runtime.js'

/** Build the ambient overlay for the style that needs one. */
export function createStyleFx({ useActiveStyle, effectStyleId }) {
  return function StyleFx() {
    const activeId = useActiveStyle()
    if (activeId === effectStyleId) {
      return h(
        'div',
        { className: 'dsg-fx', 'aria-hidden': 'true' },
        h('div', { className: 'dsg-fxBlob dsg-fxBlobA' }),
        h('div', { className: 'dsg-fxBlob dsg-fxBlobB' }),
        h('div', { className: 'dsg-fxBlob dsg-fxBlobC' }),
        h('div', { className: 'dsg-fxBlob dsg-fxBlobD' }),
      )
    }
    return null
  }
}

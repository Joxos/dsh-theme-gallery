import { h } from '../runtime.js'

/** Miniature app sketch used as the preview on each style card. */
export function GalleryPreview(props) {
  return h(
    'span',
    { className: 'dsg-pvw', 'data-style': props.styleId, 'aria-hidden': 'true' },
    h(
      'span',
      { className: 'dsg-pvwSide' },
      h('span', { className: 'dsg-pvwDot' }),
      h('span', { className: 'dsg-pvwNav dsg-pvwNavOn' }),
      h('span', { className: 'dsg-pvwNav' }),
      h('span', { className: 'dsg-pvwNav dsg-pvwNavShort' }),
    ),
    h(
      'span',
      { className: 'dsg-pvwMain' },
      h(
        'span',
        { className: 'dsg-pvwHead' },
        h('span', { className: 'dsg-pvwAa' }, 'Aa'),
        h('span', { className: 'dsg-pvwAccent' }),
      ),
      h('span', { className: 'dsg-pvwLine dsg-pvwLineWide' }),
      h('span', { className: 'dsg-pvwLine' }),
      h('span', { className: 'dsg-pvwLine dsg-pvwLineMid' }),
      h('span', { className: 'dsg-pvwCta' }),
    ),
  )
}

import { h } from '../runtime.js'

/** Sidebar entry glyph: a four-dot palette. */
export function GalleryIcon(props) {
  const size = props !== null && props !== undefined && typeof props.size === 'number' ? props.size : 18
  return h(
    'svg',
    {
      width: size,
      height: size,
      viewBox: '0 0 20 20',
      fill: 'none',
      'aria-hidden': 'true',
      focusable: 'false',
      style: { display: 'block' },
    },
    h('path', {
      d: 'M10 2.7a7.3 7.3 0 1 0 0 14.6c1.14 0 1.83-.83 1.83-1.86 0-1.34 1.06-1.98 2.42-1.98h.99A2.16 2.16 0 0 0 17.4 11.3 7.6 7.6 0 0 0 10 2.7Z',
      stroke: 'currentColor',
      strokeWidth: 1.4,
      strokeLinejoin: 'round',
    }),
    h('circle', { cx: 6.7, cy: 8.6, r: 1.15, fill: 'currentColor' }),
    h('circle', { cx: 9.8, cy: 5.9, r: 1.15, fill: 'currentColor' }),
    h('circle', { cx: 13.1, cy: 7.4, r: 1.15, fill: 'currentColor' }),
  )
}

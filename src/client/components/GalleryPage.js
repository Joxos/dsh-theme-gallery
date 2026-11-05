import { h } from '../runtime.js'
import { GalleryPreview } from './GalleryPreview.js'

/**
 * Build the gallery page for one plugin instance.
 *
 * `useActiveStyle` subscribes to the selection store; `onSelect` applies and
 * persists the chosen style.
 */
export function createGalleryPage({ styles, nativeId, translator, useActiveStyle, onSelect }) {
  return function GalleryPage(props) {
    const t = props !== null && props !== undefined && typeof props.t === 'function' ? props.t : translator
    const activeId = useActiveStyle()
    const activeStyle = styles.find((spec) => spec.id === activeId)
    const activeName = activeStyle === undefined ? t('page.native') : t(activeStyle.nameKey)
    return h(
      'div',
      { className: 'dsg-page' },
      h(
        'div',
        { className: 'dsg-head' },
        h(
          'div',
          { className: 'dsg-headText' },
          h('h1', { className: 'dsg-title' }, t('page.title')),
          h('p', { className: 'dsg-intro' }, t('page.intro')),
        ),
        h(
          'div',
          { className: 'dsg-actions' },
          h(
            'span',
            { className: 'dsg-current' },
            h('span', { className: 'dsg-currentDot', 'aria-hidden': 'true' }),
            activeName,
          ),
          h(
            'button',
            {
              type: 'button',
              className: 'dsg-reset',
              disabled: activeId === nativeId,
              onClick: () => {
                onSelect(nativeId)
              },
            },
            t('page.reset'),
          ),
        ),
      ),
      h(
        'div',
        { className: 'dsg-grid', role: 'group', 'aria-label': t('page.gridLabel') },
        styles.map((spec) => {
          const active = spec.id === activeId
          return h(
            'button',
            {
              key: spec.id,
              type: 'button',
              className: active ? 'dsg-card dsg-cardOn' : 'dsg-card',
              'aria-pressed': active,
              onClick: () => {
                onSelect(spec.id)
              },
            },
            h(GalleryPreview, { styleId: spec.id }),
            h(
              'span',
              { className: 'dsg-cardBody' },
              h(
                'span',
                { className: 'dsg-cardHead' },
                h('span', { className: 'dsg-cardName' }, t(spec.nameKey)),
                active
                  ? h(
                      'span',
                      { className: 'dsg-chip' },
                      h('span', { className: 'dsg-chipDot', 'aria-hidden': 'true' }),
                      t('chip.active'),
                    )
                  : null,
              ),
              h('span', { className: 'dsg-cardDesc' }, t(spec.descKey)),
            ),
          )
        }),
      ),
      h('p', { className: 'dsg-foot' }, t('page.footnote')),
      h('span', { className: 'dsg-sr', 'aria-live': 'polite' }, t('a11y.applied', { name: activeName })),
    )
  }
}

import { getReact, h } from '../runtime.js'
import { GalleryPreview } from './GalleryPreview.js'

/**
 * Build the gallery page for one plugin instance.
 *
 * `useActiveStyle` subscribes to the selection store; `onSelect` applies and
 * persists the chosen style. Styles that opt in with `cycle` get a motion
 * cycle slider on their card; the slider must not trigger the card itself,
 * so the card is a `role="button"` div and guards its own events.
 */
export function createGalleryPage({ styles, nativeId, translator, useActiveStyle, onSelect, cycleStore }) {
  return function GalleryPage(props) {
    const t = props !== null && props !== undefined && typeof props.t === 'function' ? props.t : translator
    const React = getReact()
    const activeId = useActiveStyle()
    const [cycle, setCycleState] = React.useState(() => cycleStore.getSnapshot())
    const activeStyle = styles.find((spec) => spec.id === activeId)
    const activeName = activeStyle === undefined ? t('page.native') : t(activeStyle.nameKey)

    const onCycleInput = (event) => {
      const next = Number.parseFloat(event.target.value)
      if (!Number.isFinite(next)) return
      cycleStore.set(next)
      setCycleState(cycleStore.getSnapshot())
    }

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
            'div',
            {
              key: spec.id,
              role: 'button',
              tabIndex: 0,
              className: active ? 'dsg-card dsg-cardOn' : 'dsg-card',
              'aria-pressed': active,
              onClick: (event) => {
                if (event.target !== event.currentTarget && event.target.closest('.dsg-cycleRow')) return
                onSelect(spec.id)
              },
              onKeyDown: (event) => {
                if (event.target !== event.currentTarget) return
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onSelect(spec.id)
                }
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
            spec.cycle
              ? h(
                  'span',
                  { className: 'dsg-cycleRow' },
                  h('span', { className: 'dsg-cycleLabel' }, t('card.cycleLabel')),
                  h('input', {
                    type: 'range',
                    className: 'dsg-cycleSlider',
                    min: cycleStore.min,
                    max: cycleStore.max,
                    step: cycleStore.step,
                    value: cycle,
                    'aria-label': t('card.cycleLabel'),
                    onChange: onCycleInput,
                  }),
                  h('span', { className: 'dsg-cycleValue' }, t('card.cycleValue', { value: String(parseFloat(cycle.toFixed(2))) })),
                )
              : null,
          )
        }),
      ),
      h('p', { className: 'dsg-foot' }, t('page.footnote')),
      h('span', { className: 'dsg-sr', 'aria-live': 'polite' }, t('a11y.applied', { name: activeName })),
    )
  }
}

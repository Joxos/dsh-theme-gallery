import baseCss from './styles/page.css'
import {
  CYCLE_DEFAULT,
  CYCLE_KEY,
  CYCLE_MAX,
  CYCLE_MIN,
  CYCLE_STEP,
  EFFECT_STYLE_ID,
  NATIVE_ID,
  NS,
  PANEL_ID,
  SOURCE,
  STORAGE_KEY,
} from './constants.js'
import { createCycleStore } from './cycle.js'
import { mountAuroraStack, mountGelLayer } from './effects/ambient.js'
import { createGalleryPage } from './components/GalleryPage.js'
import { GalleryIcon } from './components/GalleryIcon.js'
import { createStyleFx } from './components/StyleFx.js'
import { DICTIONARIES } from './i18n.js'
import { STYLES } from './presets/index.js'
import { createSelectionStore } from './selection.js'
import { createUseActiveStyle } from './useActiveStyle.js'

/** Build the browser half that owns the sidebar entry and the theme layers. */
export function createPlugin() {
  return {
    inject: ['slots', 'theme', 'locale'],
    apply(ctx) {
      const theme = ctx.theme
      const locale = ctx.locale
      const translator = locale.bind(NS)
      const selection = createSelectionStore({ storageKey: STORAGE_KEY, nativeId: NATIVE_ID, styles: STYLES })
      const cycle = createCycleStore({
        storageKey: CYCLE_KEY,
        min: CYCLE_MIN,
        max: CYCLE_MAX,
        step: CYCLE_STEP,
        fallback: CYCLE_DEFAULT,
      })
      const useActiveStyle = createUseActiveStyle(selection)

      let tokenDispose = null
      let styleTag = null
      let aurora = null

      /**
       * The aurora background is a fixed layer stack of its own instead of the
       * page-body background: an animated `background-position` repaints the
       * window every frame, while translated layers stay on the compositor.
       * Each layer is a small baked canvas that IS its compositor texture
       * (see `effects/ambient.js`), and the gel overlay — formerly the
       * `body::after` pseudo-element — mounts beside the stack.
       */
      function mountAurora() {
        if (aurora !== null) return
        aurora = { stack: mountAuroraStack(), gel: mountGelLayer() }
      }

      function unmountAurora() {
        if (aurora === null) return
        aurora.gel.dispose()
        aurora.stack.dispose()
        aurora = null
      }

      /** Color token layer + structural rules for one style id ('native' clears both). */
      function commit(id) {
        const spec = STYLES.find((candidate) => candidate.id === id)
        if (spec === undefined) {
          if (tokenDispose !== null) {
            tokenDispose()
            tokenDispose = null
          }
        } else {
          tokenDispose = theme.overrideTokens(SOURCE, spec.tokens)
        }
        // Install the structural rules before mounting: the ambient canvases
        // size their backing stores from the geometry those rules define.
        if (styleTag !== null) {
          styleTag.textContent = baseCss + (spec === undefined ? '' : '\n' + spec.structural)
        }
        if (spec !== undefined && spec.id === EFFECT_STYLE_ID) mountAurora()
        else unmountAurora()
        selection.setActive(spec === undefined ? NATIVE_ID : spec.id)
        selection.emit()
      }

      ctx.effect(() => locale.register(NS, DICTIONARIES), 'style gallery: dictionaries')

      ctx.effect(() => {
        cycle.set(cycle.readSaved(), { persist: false })
        return () => {
          cycle.clearListeners()
          cycle.clear()
        }
      }, 'style gallery: motion cycle')

      ctx.effect(() => {
        const tag = document.createElement('style')
        tag.setAttribute('data-plugin-css', SOURCE)
        tag.textContent = baseCss
        document.head.append(tag)
        styleTag = tag
        commit(selection.readSaved())
        return () => {
          if (tokenDispose !== null) {
            tokenDispose()
            tokenDispose = null
          }
          selection.setActive(NATIVE_ID, { persist: false })
          unmountAurora()
          styleTag = null
          tag.remove()
          selection.clearListeners()
        }
      }, 'style gallery: active style layer')

      const GalleryPage = createGalleryPage({
        styles: STYLES,
        nativeId: NATIVE_ID,
        translator,
        useActiveStyle,
        onSelect: commit,
        cycleStore: cycle,
      })
      const StyleFx = createStyleFx({ useActiveStyle, effectStyleId: EFFECT_STYLE_ID })

      ctx.slots.inject('sidebar.panellist', () =>
        ctx.slots.register(
          {
            name: 'sidebar.panellist',
            id: PANEL_ID,
            order: 20,
            label: () => translator('entry.label'),
            locale: NS,
          },
          GalleryIcon,
        ),
      )

      ctx.slots.inject('main', () =>
        ctx.slots.register(
          {
            name: 'main',
            key: PANEL_ID,
            locale: NS,
          },
          GalleryPage,
        ),
      )

      ctx.slots.inject('shell.overlay', () =>
        ctx.slots.register(
          {
            name: 'shell.overlay',
            id: 'style-gallery-fx',
            order: 0,
          },
          StyleFx,
        ),
      )
    },
  }
}

/* global __PACKAGE_ID__ */

/** Locale namespace owned by this plugin. */
export const NS = 'styleGallery'

/** One id shared by the sidebar row and the main panel it opens. */
export const PANEL_ID = 'style-gallery'

/**
 * Package id, injected by `scripts/build-client.mjs` from package.json.
 * Keeping it build-time avoids a browser module registered under a stale name
 * after a package rename.
 */
export const PACKAGE_ID = __PACKAGE_ID__

/** Theme override source; one layer per source in the theme runtime. */
export const SOURCE = PACKAGE_ID

/** Where the selected style is remembered for the next page load. */
export const STORAGE_KEY = 'dsh.style-gallery.active'

/** Id that means "no plugin layer"; the host theme stays untouched. */
export const NATIVE_ID = 'native'

/** Style whose ambient overlay is mounted in `shell.overlay`. */
export const EFFECT_STYLE_ID = 'cyber'

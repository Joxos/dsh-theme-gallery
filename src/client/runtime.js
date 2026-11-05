/**
 * Bridge to the browser module table.
 *
 * The generated artifact is a classic script, so React is resolved from the
 * loader's `require` inside the factory instead of being imported at module
 * scope.
 */
let ReactModule = null

/** Resolve React from the loader and make it available to every module. */
export function bindReact(require) {
  const react = require('react')
  if (react === null || react === undefined || typeof react.createElement !== 'function') {
    throw new Error('style-gallery: the host React module is unavailable')
  }
  ReactModule = react
}

/** The host React instance; valid after `bindReact`. */
export function getReact() {
  if (ReactModule === null) {
    throw new Error('style-gallery: React was not bound before the plugin ran')
  }
  return ReactModule
}

/** `React.createElement` through the bound module. */
export function h(...args) {
  return getReact().createElement(...args)
}

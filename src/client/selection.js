/**
 * Selected style id plus the listeners that render it.
 *
 * Applying the style itself stays in the plugin: this store only owns the
 * value, its persistence and its subscription.
 */
export function createSelectionStore({ storageKey, nativeId, styles }) {
  let activeId = nativeId
  const listeners = new Set()

  const isKnown = (id) => styles.some((spec) => spec.id === id)

  function emit() {
    for (const listener of [...listeners]) {
      try {
        listener()
      } catch (error) {
        console.error('style-gallery: selection listener crashed', error)
      }
    }
  }

  function getSnapshot() {
    return activeId
  }

  function subscribe(listener) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }

  function readSaved() {
    try {
      const saved = localStorage.getItem(storageKey)
      return typeof saved === 'string' && isKnown(saved) ? saved : nativeId
    } catch (error) {
      return nativeId
    }
  }

  function setActive(id, { persist = true } = {}) {
    activeId = isKnown(id) ? id : nativeId
    if (!persist) return
    try {
      localStorage.setItem(storageKey, activeId)
    } catch (error) {
      /* Private mode or a blocked origin: the style still applies for this run. */
    }
  }

  function clearListeners() {
    listeners.clear()
  }

  return { getSnapshot, subscribe, emit, readSaved, setActive, clearListeners }
}

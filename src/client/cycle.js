/**
 * Motion-cycle multiplier plus the listeners that apply it.
 *
 * The value scales every ambient animation duration through the
 * `--dsg-cycle-scale` custom property (larger = slower). It persists like the
 * selected style and clamps to the slider bounds.
 */
export function createCycleStore({ storageKey, min, max, step = 0.05, fallback }) {
  let value = fallback
  const listeners = new Set()

  const clamp = (candidate) => Math.min(max, Math.max(min, candidate))

  function emit() {
    for (const listener of [...listeners]) {
      try {
        listener()
      } catch (error) {
        console.error('style-gallery: cycle listener crashed', error)
      }
    }
  }

  function getSnapshot() {
    return value
  }

  function subscribe(listener) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }

  function readSaved() {
    try {
      const saved = Number.parseFloat(localStorage.getItem(storageKey))
      return Number.isFinite(saved) ? clamp(saved) : fallback
    } catch (error) {
      return fallback
    }
  }

  /** Push the value into the stylesheet custom property. */
  function apply(target = document.documentElement) {
    target.style.setProperty('--dsg-cycle-scale', String(value))
  }

  function set(next, { persist = true } = {}) {
    value = clamp(next)
    apply()
    if (!persist) return
    try {
      localStorage.setItem(storageKey, String(value))
    } catch (error) {
      /* Private mode or a blocked origin: the cycle still applies for this run. */
    }
    emit()
  }

  /** Undo `apply` on dispose so a removed plugin leaves no residue. */
  function clear() {
    try {
      document.documentElement.style.removeProperty('--dsg-cycle-scale')
    } catch (error) {
      /* no document to clean */
    }
  }

  function clearListeners() {
    listeners.clear()
  }

  return { min, max, step, getSnapshot, subscribe, readSaved, apply, set, clear, clearListeners }
}

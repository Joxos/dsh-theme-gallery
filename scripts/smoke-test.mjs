import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'
import assert from 'node:assert/strict'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'))
const code = await readFile(path.join(root, 'client.js'), 'utf8')
const STORAGE_KEY = 'dsh.style-gallery.active'

const React = {
  createElement(type, props, ...children) {
    return { type, props, children }
  },
  useState(initial) {
    return [initial, () => {}]
  },
  useEffect() {},
  useRef(initial) {
    return { current: initial }
  },
}

/** Minimal 2D context stub that records the bake traffic. */
function fakeContext(node) {
  return {
    fillStyle: null,
    save() {},
    restore() {},
    translate() {},
    scale() {},
    rotate() {},
    setTransform() {},
    clearRect() {},
    fillRect() {
      node.fills = (node.fills ?? 0) + 1
    },
    drawImage() {
      node.fills = (node.fills ?? 0) + 1
    },
    createRadialGradient() {
      return {
        addColorStop(t, css) {
          ;(node.gradientStops ??= []).push([t, css])
        },
      }
    },
    createLinearGradient() {
      return {
        addColorStop(t, css) {
          ;(node.gradientStops ??= []).push([t, css])
        },
      }
    },
    getImageData(x, y, w, h) {
      return { data: new Uint8ClampedArray(w * h * 4) }
    },
  }
}

/** Load the built bundle in an isolated VM with fake browser globals. */
function loadBundle(savedStyle) {
  const loaded = []
  const tags = []
  const store = new Map()
  if (savedStyle !== undefined) store.set(STORAGE_KEY, savedStyle)

  const localStorage = {
    getItem(key) {
      return store.has(key) ? store.get(key) : null
    },
    setItem(key, value) {
      store.set(key, String(value))
    },
  }

  const rootStyle = {
    props: new Map(),
    removed: [],
    setProperty(name, value) {
      this.props.set(name, value)
    },
    removeProperty(name) {
      this.props.delete(name)
      this.removed.push(name)
    },
  }

  const document = {
    head: {
      children: [],
      append(node) {
        this.children.push(node)
        tags.push(node)
      },
    },
    documentElement: { style: rootStyle },
    body: {
      children: [],
      append(node) {
        this.children.push(node)
      },
      hasAttribute() {
        return false
      },
    },
    createElement(tagName) {
      return {
        tagName: tagName.toUpperCase(),
        className: '',
        attributes: {},
        children: [],
        textContent: '',
        style: {},
        removed: false,
        // Snapshot of the installed stylesheets, for mount-order assertions.
        styleAtCreation: document.head.children
          .filter((node) => node.tagName === 'STYLE')
          .map((node) => node.textContent)
          .join('\n'),
        setAttribute(name, value) {
          this.attributes[name] = value
        },
        append(node) {
          this.children.push(node)
        },
        remove() {
          this.removed = true
        },
        getBoundingClientRect() {
          return { left: 0, top: 0, width: 200, height: 100 }
        },
        getContext(kind) {
          this.contextKind = kind
          this.context ??= fakeContext(this)
          return this.context
        },
      }
    },
  }

  class FakeMutationObserver {
    constructor(callback) {
      this.callback = callback
    }
    observe() {}
    disconnect() {}
  }

  const window = {
    innerWidth: 1280,
    innerHeight: 800,
    addEventListener() {},
    removeEventListener() {},
    __ModuleLoader__: {
      load(config) {
        loaded.push(config)
      },
    },
  }

  const context = vm.createContext({ window, document, localStorage, console, MutationObserver: FakeMutationObserver })
  vm.runInContext(code, context, { filename: 'client.js' })
  assert.equal(loaded.length, 1, 'the bundle must register exactly one module factory')
  return { config: loaded[0], tags, store, body: document.body, rootStyle }
}

/** Apply the plugin against a minimal context and capture its effects. */
function applyBundle(savedStyle) {
  const harness = loadBundle(savedStyle)
  assert.equal(harness.config.id, pkg.name, 'bundle id must match package.json name')

  let required = null
  const plugin = harness.config.factory((id) => {
    required = id
    if (id !== 'react') throw new Error(`unexpected require(${id})`)
    return React
  })
  assert.equal(required, 'react', 'the factory must resolve React from the loader')

  const effects = []
  const registrations = []
  const layers = []
  const dictionaries = []

  const ctx = {
    effect(callback, label) {
      effects.push({ label, cleanup: callback() })
    },
    theme: {
      overrideTokens(source, tokens) {
        const layer = { source, tokens, disposed: false }
        layers.push(layer)
        return () => {
          layer.disposed = true
        }
      },
    },
    locale: {
      bind(namespace) {
        return (key) => `${namespace}:${key}`
      },
      register(namespace, dictionariesByLocale) {
        dictionaries.push({ namespace, dictionariesByLocale })
        return () => {}
      },
    },
    slots: {
      inject(name, callback) {
        callback()
      },
      register(options, component) {
        registrations.push({ options, component })
        return () => {}
      },
    },
  }

  assert.deepEqual([...plugin.inject], ['slots', 'theme', 'locale'])
  plugin.apply(ctx)

  return { ...harness, effects, registrations, layers, dictionaries }
}

function cleanup(run) {
  for (const effect of [...run.effects].reverse()) {
    if (typeof effect.cleanup === 'function') effect.cleanup()
  }
}

const native = applyBundle()
assert.equal(native.tags.length, 1, 'one stylesheet tag must be installed')
assert.equal(native.tags[0].attributes['data-plugin-css'], pkg.name)
assert.ok(native.tags[0].textContent.includes('.dsg-page'), 'the base gallery stylesheet must be installed')
assert.equal(native.layers.length, 0, 'no token layer is installed for the native look')
assert.equal(native.body.children.length, 0, 'the native look must not mount the aurora layer')
assert.equal(native.registrations.length, 3, 'sidebar entry, main page and overlay must be registered')
assert.deepEqual(
  native.registrations.map((entry) => entry.options.name).sort(),
  ['main', 'shell.overlay', 'sidebar.panellist'],
)
for (const entry of native.registrations) {
  assert.equal(typeof entry.component, 'function', `${entry.options.name} must have a component`)
}
assert.equal(native.dictionaries.length, 1)
assert.equal(native.dictionaries[0].namespace, 'styleGallery')
assert.equal(native.store.get(STORAGE_KEY), 'native')
cleanup(native)
assert.equal(native.tags[0].removed, true, 'the stylesheet tag must be removed on dispose')

const cyber = applyBundle('cyber')
assert.equal(cyber.tags.length, 1)
assert.equal(cyber.layers.length, 1, 'the saved cyber style must install one token layer')
assert.equal(cyber.layers[0].source, pkg.name)
assert.ok('--dsw-alias-bg-base' in cyber.layers[0].tokens, 'the cyber layer must carry color tokens')
assert.ok(cyber.tags[0].textContent.includes('dsg-aurora'), 'the cyber structural rules must be installed')
assert.ok(
  cyber.tags[0].textContent.includes('body>:not(#root)'),
  'the cyber rules must make every portalled popup opaque by default',
)
assert.ok(
  cyber.tags[0].textContent.includes('[role="dialog"]'),
  'the popup default must also cover inline dialog surfaces',
)
assert.ok(
  cyber.tags[0].textContent.includes('--dsw-alias-bg-layer-2:var(--dsw-specific-input-major)'),
  'the popup default must bind the card surface to the opaque input surface',
)
assert.ok(
  !cyber.tags[0].textContent.includes('[data-shortcut-modal="settings"]'),
  'the popup default must not need a per-component settings selector',
)
assert.ok(
  !cyber.tags[0].textContent.includes('div[style*="--dsh-hover-preview-fade"]'),
  'the popup default must not need a per-component preview selector',
)
assert.ok(cyber.tags[0].textContent.includes('dsg-drift-a'), 'the composited aurora drift must be installed')
assert.ok(cyber.tags[0].textContent.includes('dsg-gel'), 'the gel overlay rules must be installed')
assert.equal(cyber.body.children.length, 2, 'the cyber style must mount the aurora stack and the gel overlay')
assert.equal(cyber.body.children[0].className, 'dsg-aurora')
assert.equal(cyber.body.children[1].className, 'dsg-gel')
assert.deepEqual(
  cyber.body.children[0].children.map((node) => node.className),
  ['dsg-auroraBase', 'dsg-auroraLayer dsg-aurora-a', 'dsg-auroraLayer dsg-aurora-b', 'dsg-auroraLayer dsg-aurora-c', 'dsg-auroraLayer dsg-aurora-d'],
  'the aurora background must keep the base plus one layer per original gradient',
)
for (const canvas of [...cyber.body.children[0].children, cyber.body.children[1]]) {
  assert.equal(canvas.tagName, 'CANVAS', `${canvas.className} must be a canvas sprite`)
  assert.ok(canvas.width > 0 && canvas.height > 0, `${canvas.className} must have a backing store`)
  assert.ok((canvas.gradientStops ?? []).length > 0, `${canvas.className} must be baked from gradient stops`)
  assert.ok(
    canvas.styleAtCreation.includes('dsg-drift-a'),
    `${canvas.className} must be created after the structural rules are installed (backing stores size from that geometry)`,
  )
}
assert.ok(
  cyber.body.children[1].gradientStops.length > 3,
  'the gel bake must paint all three of its radial gradients',
)
assert.equal(cyber.store.get(STORAGE_KEY), 'cyber')
assert.ok(
  cyber.tags[0].textContent.includes('dsg-cycle-scale'),
  'the structural rules must scale every animation through the cycle property',
)
assert.equal(
  cyber.rootStyle.props.get('--dsg-cycle-scale'),
  '2',
  'the motion cycle must apply the default multiplier on startup',
)
cleanup(cyber)
assert.ok(cyber.rootStyle.removed.includes('--dsg-cycle-scale'), 'the cycle property must be removed on dispose')
assert.equal(cyber.tags[0].removed, true)
assert.equal(cyber.body.children[0].removed, true, 'the aurora layer must be removed with the style')
assert.equal(cyber.body.children[1].removed, true, 'the gel overlay must be removed with the style')
assert.equal(cyber.layers[0].disposed, true, 'the token layer must be disposed with the style')

const unknown = applyBundle('does-not-exist')
assert.equal(unknown.layers.length, 0, 'an unknown saved id must fall back to the native look')
assert.equal(unknown.store.get(STORAGE_KEY), 'native')
assert.equal(unknown.body.children.length, 0, 'an unknown saved id must not mount the aurora layer')

const retired = applyBundle('pixel')
assert.equal(retired.store.get(STORAGE_KEY), 'native', 'a saved id from a removed style must fall back to the native look')
assert.equal(retired.body.children.length, 0, 'a removed style must not mount anything')

console.log(`smoke test passed for ${pkg.name}@${pkg.version}`)

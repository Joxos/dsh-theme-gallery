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

  const document = {
    head: {
      append(node) {
        tags.push(node)
      },
    },
    createElement(tagName) {
      return {
        tagName,
        attributes: {},
        textContent: '',
        removed: false,
        setAttribute(name, value) {
          this.attributes[name] = value
        },
        remove() {
          this.removed = true
        },
      }
    },
  }

  const window = {
    __ModuleLoader__: {
      load(config) {
        loaded.push(config)
      },
    },
  }

  const context = vm.createContext({ window, document, localStorage, console })
  vm.runInContext(code, context, { filename: 'client.js' })
  assert.equal(loaded.length, 1, 'the bundle must register exactly one module factory')
  return { config: loaded[0], tags, store }
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
assert.ok(cyber.tags[0].textContent.includes('dsg-cyber-drift'), 'the cyber structural rules must be installed')
assert.equal(cyber.store.get(STORAGE_KEY), 'cyber')
cleanup(cyber)
assert.equal(cyber.tags[0].removed, true)
assert.equal(cyber.layers[0].disposed, true, 'the token layer must be disposed with the style')

const unknown = applyBundle('does-not-exist')
assert.equal(unknown.layers.length, 0, 'an unknown saved id must fall back to the native look')
assert.equal(unknown.store.get(STORAGE_KEY), 'native')

console.log(`smoke test passed for ${pkg.name}@${pkg.version}`)

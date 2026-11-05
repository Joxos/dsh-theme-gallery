import { PACKAGE_ID } from './constants.js'
import { createPlugin } from './plugin.js'
import { bindReact } from './runtime.js'

window.__ModuleLoader__.load({
  id: PACKAGE_ID,
  factory(require) {
    bindReact(require)
    return createPlugin()
  },
})

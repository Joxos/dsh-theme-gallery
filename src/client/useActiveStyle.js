import { getReact } from './runtime.js'

/** Build the hook that re-renders a slot component when the style changes. */
export function createUseActiveStyle(store) {
  return function useActiveStyle() {
    const React = getReact()
    const [id, setId] = React.useState(store.getSnapshot())
    React.useEffect(() => store.subscribe(() => setId(store.getSnapshot())), [])
    return id
  }
}

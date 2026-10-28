import { useSyncExternalStore } from 'react'

const subscribe = (cb: () => void) => (addEventListener('hashchange', cb), () => removeEventListener('hashchange', cb))
const read = () => location.hash.slice(1)

/** Current hash without '#'. */
export const useHashPath = () => useSyncExternalStore(subscribe, read)

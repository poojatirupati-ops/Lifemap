import { flow } from './flow.data.ts'

// History bookkeeping for the hash router. Pure helpers plus one listener. Each history entry carries its index in
// history.state.i, so a hashchange can be told apart: new entry (push), same entry replaced, or Back/Forward.
export type Dir = 'forward' | 'back'

let idx = (history.state as { i?: number } | null)?.i ?? 0
let dir: Dir = 'forward'
let replacing = false
const stamp = () => history.replaceState({ ...history.state, i: idx }, '')
stamp()

addEventListener('hashchange', () => {
  const i = (history.state as { i?: number } | null)?.i
  if (typeof i === 'number') { dir = i < idx ? 'back' : 'forward'; idx = i } // Back/Forward
  else { if (!replacing) idx++; dir = 'forward'; stamp() } // push, or a replace that keeps its slot
  replacing = false
})

export const direction = () => dir
export const canGoBack = () => idx > 0

/** Guard redirects and fallbacks: swap the current entry so Back never loops through them. */
export function replace(to: string) {
  if (location.hash === `#${to}`) return
  replacing = true
  location.replace(`#${to}`)
}

/** Where Back goes when there is no history (deep link, reload into a flow): one step up the onboarding flow. */
export function parent(hash: string): string {
  const [path = '', qs = ''] = hash.split('?')
  if (path === '/sign-in' && qs.includes('step=code')) return `${path}?${qs.replace(/&?step=code/, '').replace(/^&/, '')}`.replace(/\?$/, '')
  const q = Number(new URLSearchParams(qs).get('q'))
  if (path === '/discover' && q > 0) return q > 1 ? `/discover?q=${q - 1}` : '/discover'
  const i = (flow as readonly string[]).indexOf(path)
  return i > 0 ? flow[i - 1]! : '/home'
}

export const goBack = (hash: string) => (canGoBack() ? history.back() : replace(parent(hash)))

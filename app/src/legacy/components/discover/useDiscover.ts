import { DISCOVER } from '../../content/discover.data.ts'
import { useHashPath } from '../../shell/useHashPath.ts'
import { getPlan, setPlan, usePlan } from '../../state/store.ts'

const last = DISCOVER.length - 1

/** Local only: answers go to the store (localStorage), nothing is sent anywhere. The step lives in the URL (#/discover?q=2) so browser Back steps back too. */
export function useDiscover() {
  const n = Number(new URLSearchParams(useHashPath().split('?')[1]).get('q'))
  const i = Number.isInteger(n) ? Math.min(Math.max(n, 0), last) : 0
  const ans = usePlan().ans
  const q = DISCOVER[i]!
  return {
    q, selected: ans[q.id],
    answer(o: number) {
      setPlan({ ans: { ...getPlan().ans, [q.id]: o }, fromPublic: true })
      location.hash = i < last ? `#/discover?q=${i + 1}` : '#/reveal'
    },
  }
}

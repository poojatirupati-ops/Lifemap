// Moving around Explore's page stack (plan.xs) and out of it.
// TODO(Q-01): move into an explore slice in src/state once the store has per-context slices.
import { useStore } from '../../state/store.ts'
import { rerender, toast } from '../../state/shell.ts'
import { EXPERTS } from '../../domain/identity/advisers.data.ts'
import type { Plan } from '../../state/types.ts'

const store = () => useStore.getState()

/** Open a page on top of Explore's stack, from any tab. */
function openPage(page: Plan['xs'][number], also?: (plan: Plan) => void) {
  store().update((plan) => {
    if (plan.tab !== 'explore') {
      plan.tab = 'explore'
      plan.xs = []
    }
    also?.(plan)
    plan.xs.push(page)
  })
  store().closeSheet()
  rerender()
}

export const openTopic = (name: string) => openPage({ v: 'XTOPIC', p: name })
export const openCategory = (id: string) => openPage({ v: 'XCAT', p: id })
export const openCalculator = (id: string) => openPage({ v: 'CALC', p: id })
export const openVideos = () => openPage({ v: 'VIDS' })
export const openVideo = (id: string) =>
  openPage({ v: 'VID', p: id }, (plan) => void (plan.play = false))

/** Back one Explore page; leaving the sign-in gate returns to where the customer was. */
export function exploreBack() {
  const { after, xs } = store().plan
  const top = xs.at(-1)
  if (top?.v === 'ACCT' && after) store().go(String(after.scr))
  store().update((plan) => {
    plan.xs.pop()
    if (top?.v === 'ACCT') plan.after = null
    if (top?.v === 'PST') plan.pst = null
    plan.play = false
  })
  rerender()
}

/** The Experts tab, with this kind of expert picked when there is one. */
export function talkToExpert(kind: string) {
  store().update((plan) => {
    plan.tab = 'exp'
    plan.exp = 'home'
    plan.xs = []
    plan.play = false
    // TODO(R-27): book.spec is missing from the Plan type
    if (kind in EXPERTS) Object.assign(plan.book, { spec: kind })
  })
  store().closeSheet()
  rerender()
}

// TODO(R-27): xf (the featured focus area) is missing from the Plan type
type WithFocusArea = { xf?: number }

/** Which focus area the Explore card shows. */
export const focusAreaOf = (plan: Plan) => (plan as WithFocusArea).xf ?? 0

export const showFocusArea = (index: number) =>
  store().update((plan) => void ((plan as WithFocusArea).xf = index))

export const remindMe = () => toast("We'll remind you before it starts")

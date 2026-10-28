// What the goal picker (F1) and Your LifeMap (F4) do.
// TODO(Q-01): move into a goals slice in src/state once the store has per-context slices.
import { newGoal } from '../../domain/goals/goals.ts'
import { fundingOrder } from '../../domain/planning/fund.ts'
import { toast } from '../../state/shell.ts'
import { useStore } from '../../state/store.ts'
import type { Plan } from '../../state/types.ts'

const store = () => useStore.getState()

/** Be mortgage-free is only for homeowners with a mortgage. */
export const hasNoMortgage = (home: unknown) => !!home && home !== 'Own with mortgage'

// TODO(R-23): share with the plan's own version notes
function saveVersion(plan: Plan, note: string) {
  plan.versions.push({ note, date: '29 Sep 2026' })
}

export function toggleGoal(key: string) {
  const { plan } = store()
  const picked = plan.goals.some((goal) => goal.k === key)
  if (key === 'mfree' && !picked && hasNoMortgage(plan.fin.home)) {
    toast(`Be mortgage-free is for homeowners with a mortgage. Your finances say: ${plan.fin.home}`)
    return
  }
  if (key === 'other') {
    store().openSheet('other')
    return
  }
  store().update((draft) => {
    if (picked) draft.goals = draft.goals.filter((goal) => goal.k !== key)
    else draft.goals.push(newGoal(draft, draft.gid++, key))
    const whatIfGone = draft.wi.g != null && !draft.goals.some((goal) => goal.id === draft.wi.g)
    if (whatIfGone) draft.wi = { g: null, m: 0, l: 0 }
    if (draft.app) saveVersion(draft, 'Goals changed')
  })
}

/** F4's "This looks right". */
export function confirmGoals() {
  store().update((plan) => {
    if (!plan.versions.length) saveVersion(plan, 'LifeMap confirmed')
    if (plan.acct.email === '' && plan.save.email) plan.acct.email = plan.save.email
  })
  store().go('B4')
}

/** "Change the date" on a goal whose date has passed: open it on My Plan's timeline. */
export function changeGoalDate(id: number) {
  store().update((plan) => {
    plan.tab = 'plan'
    plan.planSeg = ''
    plan.planEdit = false
    plan.tlHl = id
  })
  store().closeSheet()
}

/** Swap a goal with its neighbour; returns the status line, or null at either end. */
export function moveGoal(id: number, step: -1 | 1) {
  const order = fundingOrder(store().plan.goals, store().plan.rank).map((goal) => goal.id)
  const from = order.indexOf(id)
  const to = from + step
  if (from < 0 || to < 0 || to >= order.length) return null
  ;[order[from], order[to]] = [order[to], order[from]]
  store().update((plan) => {
    plan.rank = order
    saveVersion(plan, 'Goal priority changed')
  })
  const name = store().plan.goals.find((goal) => goal.id === id)?.name
  return `${name} is now ${to + 1} of ${order.length}`
}

export function resetRank() {
  store().update((plan) => {
    plan.rank = null
    saveVersion(plan, 'Goal priority reset')
  })
  return 'Back to the suggested order'
}

// What the goal picker (F1), Your LifeMap (F4) and the rank list do.
// TODO(Q-01): move into a goals slice in src/state once the store has per-context slices.
import { canPickGoal, newGoal } from '../../domain/goals/goals.ts'
import { fundingOrder } from '../../domain/planning/fund.ts'
import { toast } from '../../state/shell.ts'
import { useStore } from '../../state/store.ts'
import { addVersion } from '../../state/versions.ts'

export function toggleGoal(key: string) {
  const { plan, update, openSheet } = useStore.getState()
  const picked = plan.goals.some((goal) => goal.key === key)
  if (!canPickGoal(key, plan.figures.home, picked)) {
    toast(`Be mortgage-free is for homeowners with a mortgage. Your finances say: ${plan.figures.home}`)
    return
  }
  if (key === 'other') {
    openSheet('other')
    return
  }
  update((draft) => {
    if (picked) draft.goals = draft.goals.filter((goal) => goal.key !== key)
    else draft.goals.push(newGoal(draft, draft.nextGoalId++, key))
    const whatIfGone = draft.whatIf.goalId != null && !draft.goals.some((goal) => goal.id === draft.whatIf.goalId)
    if (whatIfGone) draft.whatIf = { goalId: null, monthlyExtra: 0, lumpSum: 0 }
    if (draft.hasResults) addVersion(draft, 'Goals changed')
  })
}

/** F4's "This looks right". */
export function confirmGoals() {
  const { update, go } = useStore.getState()
  update((plan) => {
    if (!plan.versions.length) addVersion(plan, 'LifeMap confirmed')
    if (plan.account.email === '' && plan.save.email) plan.account.email = plan.save.email
  })
  go('B4')
}

/** "Change the date" on a goal whose date has passed: open it on My Plan's timeline. */
export function changeGoalDate(id: number) {
  const { update, closeSheet } = useStore.getState()
  update((plan) => {
    plan.tab = 'plan'
    plan.planSegment = ''
    plan.editingGoals = false
    plan.highlightedGoal = id
  })
  closeSheet()
}

/** Move a goal from one funding position to another; returns the status line. */
export function rankGoal(from: number, to: number) {
  const { plan, update } = useStore.getState()
  const order = fundingOrder(plan.goals, plan.rank)
  const [moved] = order.splice(from, 1)
  order.splice(to, 0, moved)
  update((draft) => {
    draft.rank = order.map((goal) => goal.id)
    addVersion(draft, 'Goal priority changed')
  })
  return `${moved.name} is now ${to + 1} of ${order.length}`
}

export function resetRank() {
  useStore.getState().update((plan) => {
    plan.rank = null
    addVersion(plan, 'Goal priority reset')
  })
  return 'Back to the suggested order'
}

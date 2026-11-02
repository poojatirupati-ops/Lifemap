import { toast } from './shell.ts'
import { useStore, type SetStore, type Store } from './store.ts'
import { clamp } from '../lib/clamp.ts'
import { parseWholeEuros } from '../lib/format.ts'
import { ageLimits, canPickGoal, clampSafetyMonths, newGoal } from '../domain/goals/goals.ts'
import { fundingOrder } from '../domain/planning/fund.ts'
import type { Goal, Plan } from './types.ts'
import { addVersion } from './versions.ts'
import { goTo } from '../shell/router.ts'

const goalIn = (plan: Plan, id: number) => plan.goals.find((goal) => goal.id === id)

/** "12,000" -> 12000; blank or text -> 0. */
const wholeEuros = (typed: string) => parseWholeEuros(typed) ?? 0

/** Removes goals; a what-if on one of them is reset, and a plan with results keeps a version. */
function dropGoals(plan: Plan, dropped: (goal: Goal) => boolean) {
  plan.goals = plan.goals.filter((goal) => !dropped(goal))
  if (plan.whatIf.goalId != null && !plan.goals.some((goal) => goal.id === plan.whatIf.goalId))
    plan.whatIf = { goalId: null, monthlyExtra: 0, lumpSum: 0 }
  if (plan.hasResults) addVersion(plan, 'Goals changed')
}

export function createGoalsSlice(set: SetStore, get: () => Store) {
  const editGoal = (id: number, edit: (goal: Goal, plan: Plan) => void) =>
    get().update((plan) => {
      const goal = goalIn(plan, id)
      if (goal) edit(goal, plan)
    })

  return {
    /** Clamped to the goal's age limits; the retirement goal sets the retirement age. */
    moveGoal: (id: number, age: number) =>
      editGoal(id, (goal, plan) => {
        if (goal.kind === 'legacy') return
        const { earliest, latest } = ageLimits(plan, goal)
        goal.age = clamp(age, earliest, latest)
        if (goal.kind !== 'retire') return
        plan.retireAge = goal.age
        plan.retireSet = true
        plan.figures.retireAge = goal.age
        plan.sources.retireAge ||= 'pre'
      }),
    /** A drag ends: the app keeps a version, and a toast confirms the new age. */
    finishMove: (id: number) => {
      const goal = goalIn(get().plan, id)
      if (!goal) return
      get().update((plan) => {
        if (plan.hasResults) addVersion(plan, `${goal.name} moved to age ${goal.age}`)
      })
      toast(`${goal.name} · age ${goal.age}`)
    },
    highlightGoal: (id: number) => set({ highlightedGoal: id }),
    removeGoal: (id: number) => {
      get().update((plan) => {
        if (goalIn(plan, id)?.key === 'safety') {
          plan.safetyOff = true
          plan.safetyWanted = false
        }
        dropGoals(plan, (goal) => goal.id === id)
      })
      toast('Goal removed')
    },
    toggleDetails: (id: number) =>
      get().update((_, ui) => void (ui.timelineOpen[id] = !ui.timelineOpen[id])),
    setGoalDetail: (id: number, field: 'who' | 'flex', value: string) =>
      editGoal(id, (goal) => void (goal[field] = value)),
    renameGoal: (id: number, name: string) =>
      editGoal(id, (goal) => void (goal.name = name.slice(0, 30) || 'My goal')),
    /** Typed text, e.g. "12,000". */
    setGoalAmount: (id: number, typed: string) =>
      editGoal(id, (goal) => {
        goal.amount = wholeEuros(typed)
        goal.auto = false
      }),
    setGoalSaved: (id: number, typed: string) =>
      editGoal(id, (goal) => void (goal.saved = wholeEuros(typed))),
    /** Blank goes back to the standard months; the emergency fund follows on normalize. */
    setSafetyMonths: (typed: string) =>
      get().update((plan) => {
        const months = parseWholeEuros(typed)
        if (months == null) delete plan.assumptions.safetyMonths
        else plan.assumptions.safetyMonths = clampSafetyMonths(months)
      }),
  }
}

// What the goal picker (F1), Your LifeMap (F4) and the rank list do.

export function toggleGoal(key: string) {
  const { plan, update, openSheet } = useStore.getState()
  const picked = plan.goals.some((goal) => goal.key === key)
  if (!canPickGoal(key, plan.figures.home, picked))
    return toast(
      `Be mortgage-free is for homeowners with a mortgage. Your finances say: ${plan.figures.home}`,
    )
  if (key === 'other') return openSheet('other')
  update((draft) => {
    if (picked) dropGoals(draft, (goal) => goal.key === key)
    else {
      draft.goals.push(newGoal(draft, draft.nextGoalId++, key))
      if (draft.hasResults) addVersion(draft, 'Goals changed')
    }
  })
}

/** F4's "This looks right". */
export function confirmGoals() {
  useStore.getState().update((plan) => {
    if (!plan.versions.length) addVersion(plan, 'LifeMap confirmed')
  })
  goTo('/build/profile')
}

/** "Change the date" on a goal whose date has passed: open it on My Plan's timeline. */
export const changeGoalDate = (id: number) => useStore.getState().changeGoalDate(id)

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

/** What the timeline and the goal rows change in the plan. */
export type GoalsActions = ReturnType<typeof createGoalsSlice>

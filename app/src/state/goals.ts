import { toast } from './shell.ts'
import type { SetStore, Store } from './store.ts'
import { clamp } from '../lib/clamp.ts'
import { ageLimits, clampSafetyMonths } from '../domain/goals/goals.ts'
import type { Goal, Plan } from './types.ts'
import { addVersion } from './versions.ts'

/** What the timeline and the goal rows change in the plan. */
export interface GoalsActions {
  /** Clamped to the goal's age limits; the retirement goal sets the retirement age. */
  moveGoal: (id: number, age: number) => void
  /** A drag ends: the app keeps a version, and a toast confirms the new age. */
  finishMove: (id: number) => void
  highlightGoal: (id: number) => void
  removeGoal: (id: number) => void
  toggleDetails: (id: number) => void
  setGoalDetail: (id: number, field: 'who' | 'flex', value: string) => void
  renameGoal: (id: number, name: string) => void
  /** Typed text, e.g. "12,000". */
  setGoalAmount: (id: number, typed: string) => void
  setGoalSaved: (id: number, typed: string) => void
  /** Blank goes back to the standard months; the emergency fund follows on normalize. */
  setSafetyMonths: (typed: string) => void
}

const goalIn = (plan: Plan, id: number) => plan.goals.find((goal) => goal.id === id)

const NON_DIGITS = /\D/g

/** "12,000" -> 12000; blank or text -> NaN. */
const digitsOf = (typed: string) => parseInt(typed.replace(NON_DIGITS, ''))

/** "12,000" -> 12000; blank or text -> 0. */
const wholeEuros = (typed: string) => digitsOf(typed) || 0

export function createGoalsSlice(set: SetStore, get: () => Store): GoalsActions {
  const editGoal = (id: number, edit: (goal: Goal, plan: Plan) => void) =>
    get().update((plan) => {
      const goal = goalIn(plan, id)
      if (goal) edit(goal, plan)
    })

  return {
    moveGoal: (id, age) =>
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
    finishMove: (id) => {
      const goal = goalIn(get().plan, id)
      if (!goal) return
      get().update((plan) => {
        if (plan.hasResults) addVersion(plan, `${goal.name} moved to age ${goal.age}`)
      })
      toast(`${goal.name} · age ${goal.age}`)
    },
    highlightGoal: (id) => set({ highlightedGoal: id }),
    removeGoal: (id) => {
      get().update((plan) => {
        if (goalIn(plan, id)?.key === 'safety') {
          plan.safetyOff = true
          plan.safetyWanted = false
        }
        plan.goals = plan.goals.filter((goal) => goal.id !== id)
        if (plan.whatIf.goalId === id) plan.whatIf = { goalId: null, monthlyExtra: 0, lumpSum: 0 }
        if (plan.hasResults) addVersion(plan, 'Goals changed')
      })
      toast('Goal removed')
    },
    toggleDetails: (id) =>
      get().update((_, ui) => void (ui.timelineOpen[id] = !ui.timelineOpen[id])),
    setGoalDetail: (id, field, value) => editGoal(id, (goal) => void (goal[field] = value)),
    renameGoal: (id, name) =>
      editGoal(id, (goal) => void (goal.name = name.slice(0, 30) || 'My goal')),
    setGoalAmount: (id, typed) =>
      editGoal(id, (goal) => {
        goal.amount = wholeEuros(typed)
        goal.auto = false
      }),
    setGoalSaved: (id, typed) => editGoal(id, (goal) => void (goal.saved = wholeEuros(typed))),
    setSafetyMonths: (typed) =>
      get().update((plan) => {
        const months = digitsOf(typed)
        if (Number.isNaN(months)) delete plan.assumptions.safetyMonths
        else plan.assumptions.safetyMonths = clampSafetyMonths(months)
      }),
  }
}

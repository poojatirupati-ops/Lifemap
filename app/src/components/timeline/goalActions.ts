// What the timeline and the goal rows change in the plan.
import { useStore } from '../../state/store.ts'
import { toast } from '../../state/shell.ts'
import { assumption } from '../../domain/planning/assumptions.ts'
import { clampSafetyMonths } from '../../domain/goals/goals.ts'
import type { Goal, Plan } from '../../state/types.ts'

type AgeInputs = Pick<Plan, 'about' | 'asm' | 'fin'>

const update = (recipe: (plan: Plan) => void) => useStore.getState().update(recipe)

const goalIn = (plan: Plan, id: number) => plan.goals.find((goal) => goal.id === id)

/** Retirement can be set up to the year before the plan ends. */
export const latestRetirement = (plan: AgeInputs) =>
  Math.max((plan.about.age ?? 0) + 1, assumption(plan, 'planEnd') - 1)

/** A goal can sit from next year to the end of the plan; a legacy stays at the end. */
export function ageLimits(plan: AgeInputs, goal: Goal) {
  const earliest = (plan.about.age ?? 0) + 1
  const latest = goal.kind === 'retire' ? latestRetirement(plan) : assumption(plan, 'planEnd')
  return { earliest, latest }
}

// TODO(R-17): a version history slice; until then the app keeps the original's fixed date
const addVersion = (plan: Plan, note: string) => plan.versions.push({ note, date: '29 Sep 2026' })

export function moveGoal(id: number, age: number) {
  update((plan) => {
    const goal = goalIn(plan, id)
    if (!goal || goal.kind === 'legacy') return
    const { earliest, latest } = ageLimits(plan, goal)
    goal.age = Math.max(earliest, Math.min(latest, age))
    if (goal.kind !== 'retire') return
    plan.retireAge = goal.age
    plan.retireSet = true
    plan.fin.retireAge = goal.age
    plan.src.retireAge ||= 'pre'
  })
}

/** A drag ends: the app keeps a version, and a toast confirms the new age. */
export function finishMove(id: number) {
  const goal = goalIn(useStore.getState().plan, id)
  if (!goal) return
  update((plan) => {
    if (plan.app) addVersion(plan, `${goal.name} moved to age ${goal.age}`)
  })
  toast(`${goal.name} · age ${goal.age}`)
}

export const highlightGoal = (id: number) =>
  update((plan) => {
    plan.tlHl = id
  })

export function removeGoal(id: number) {
  update((plan) => {
    if (goalIn(plan, id)?.k === 'safety') {
      plan.safetyOff = true
      plan.safetyWanted = false
    }
    plan.goals = plan.goals.filter((goal) => goal.id !== id)
    if (plan.wi.g === id) plan.wi = { g: null, m: 0, l: 0 }
    if (plan.app) addVersion(plan, 'Goals changed')
  })
  toast('Goal removed')
}

export const toggleDetails = (id: number) =>
  update((plan) => {
    plan.tlOpen[id] = !plan.tlOpen[id]
  })

export const setGoalDetail = (id: number, field: 'who' | 'flex', value: string) =>
  update((plan) => {
    goalIn(plan, id)![field] = value
  })

export const renameGoal = (id: number, name: string) =>
  update((plan) => {
    goalIn(plan, id)!.name = name.slice(0, 30) || 'My goal'
  })

/** "12,000" -> 12000; blank or text -> 0. */
const wholeEuros = (typed: string) => Math.max(0, parseInt(typed.replace(/\D/g, '')) || 0)

export const setGoalAmount = (id: number, typed: string) =>
  update((plan) => {
    const goal = goalIn(plan, id)!
    goal.amount = wholeEuros(typed)
    goal.auto = false
  })

export const setGoalSaved = (id: number, typed: string) =>
  update((plan) => {
    goalIn(plan, id)!.saved = wholeEuros(typed)
  })

/** Blank goes back to the standard months; the emergency fund follows on normalize. */
export const setSafetyMonths = (typed: string) =>
  update((plan) => {
    const months = parseInt(typed.replace(/\D/g, ''))
    if (Number.isNaN(months)) delete plan.asm.safetyMonths
    else plan.asm.safetyMonths = clampSafetyMonths(months)
  })

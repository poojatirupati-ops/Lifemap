// How a goal's timing reads: on the timeline, in its row, on Home, in the recap and the rank list.
import { assumption, isChosen } from '../planning/assumptions.ts'
import { plural } from '../../lib/format.ts'
import type { Goal, Plan } from '../../state/types.ts'

export type TimingInputs = Pick<Plan, 'about' | 'assumptions' | 'figures' | 'retireSet'>

const ageNow = (plan: Pick<Plan, 'about'>) => plan.about.age ?? 0

export const yearsAway = (plan: TimingInputs, goal: Goal) => goal.age - ageNow(plan)

export const calendarYear = (plan: TimingInputs, age: number) =>
  assumption(plan, 'startYear') + age - ageNow(plan)

/** A goal set for an age the customer has already passed; a legacy is always at the plan's end. */
export const isPassed = (plan: Pick<Plan, 'about'>, goal: Goal) =>
  goal.kind !== 'legacy' && goal.age < ageNow(plan)

export const inYears = (years: number) => `in ${plural(years, 'yr')}`

/** "in 3 yrs · age 41 · 2030", as the goal row shows it. */
export function whenText(plan: TimingInputs, goal: Goal) {
  const year = calendarYear(plan, goal.age)
  if (goal.kind === 'legacy') {
    const end = isChosen(plan.assumptions, 'planEnd') ? ` (${assumption(plan, 'planEnd')})` : ''
    return `At the end of your plan${end}`
  }
  if (isPassed(plan, goal)) return `Age ${goal.age} · ${year} · date has passed`
  if (goal.kind === 'retire') {
    return `${plan.retireSet ? `Age ${goal.age}` : 'Age not chosen yet'} · ${year}`
  }
  return `${inYears(yearsAway(plan, goal))} · age ${goal.age} · ${year}`
}

/** The recap's line: as the goal row, but a passed date says only that. */
export const goalWhen = (plan: TimingInputs, goal: Goal) =>
  isPassed(plan, goal) ? 'Date has passed' : whenText(plan, goal)

/** The line under a goal in "Which goal first?". */
export function rankWhen(plan: TimingInputs, goal: Goal) {
  if (goal.kind === 'retire') return 'Paid from your pension'
  if (goal.kind === 'legacy') return 'What is left at the end'
  return `${calendarYear(plan, goal.age)} · age ${goal.age}`
}

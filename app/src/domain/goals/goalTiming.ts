// How a goal's timing reads on the timeline, in its row and on Home.
import { assumption, isChosen } from '../planning/assumptions.ts'
import type { Goal, Plan } from '../../state/types.ts'

export type TimingInputs = Pick<Plan, 'about' | 'assumptions' | 'figures' | 'retireSet'>

const ageNow = (plan: TimingInputs) => plan.about.age ?? 0

export const yearsAway = (plan: TimingInputs, goal: Goal) => goal.age - ageNow(plan)

export const calendarYear = (plan: TimingInputs, age: number) =>
  assumption(plan, 'startYear') + age - ageNow(plan)

/** A goal set for an age the customer has already passed. */
export const isPassed = (plan: TimingInputs, goal: Goal) =>
  goal.kind !== 'legacy' && goal.age < ageNow(plan)

export const inYears = (years: number) => `in ${years} yr${years === 1 ? '' : 's'}`

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

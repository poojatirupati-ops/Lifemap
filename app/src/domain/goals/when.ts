// When a goal happens, in words.
import { assumption, isChosen } from '../planning/assumptions.ts'
import type { Goal, Plan } from '../../state/types.ts'

type WhenInputs = Pick<Plan, 'about' | 'assumptions' | 'figures' | 'retireSet'>

const DATE_PASSED = 'Date has passed'

/** A goal whose age is before today's age; a legacy is always at the end of the plan. */
export const hasPassed = (goal: Goal, age: number | null) =>
  goal.kind !== 'legacy' && goal.age < (age ?? 0)

/** The calendar year a goal falls in. */
export const goalYear = (goal: Goal, plan: WhenInputs) =>
  assumption(plan, 'startYear') + goal.age - (plan.about.age ?? 0)

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`

function timing(goal: Goal, plan: WhenInputs) {
  if (goal.kind === 'retire') return plan.retireSet ? `Age ${goal.age}` : 'Age not chosen yet'
  const years = goal.age - (plan.about.age ?? 0)
  return `in ${plural(years, 'yr')} · age ${goal.age}`
}

export function goalWhen(goal: Goal, plan: WhenInputs) {
  if (goal.kind === 'legacy') {
    const planEnd = isChosen(plan.assumptions, 'planEnd') ? ` (${assumption(plan, 'planEnd')})` : ''
    return `At the end of your plan${planEnd}`
  }
  if (hasPassed(goal, plan.about.age)) return DATE_PASSED
  return `${timing(goal, plan)} · ${goalYear(goal, plan)}`
}

/** The line under a goal in "Which goal first?". */
export function rankWhen(goal: Goal, plan: WhenInputs) {
  if (goal.kind === 'retire') return 'Paid from your pension'
  if (goal.kind === 'legacy') return 'What is left at the end'
  return `${goalYear(goal, plan)} · age ${goal.age}`
}

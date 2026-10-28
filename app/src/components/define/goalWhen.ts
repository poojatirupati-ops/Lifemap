// When a goal happens, in words. TODO(R-16): move to src/domain/goals once that folder is open to this card.
import { assumption, isChosen } from '../../domain/planning/assumptions.ts'
import type { Goal, Plan } from '../../state/types.ts'

type WhenInputs = Pick<Plan, 'about' | 'asm' | 'fin' | 'retireSet'>

export const DATE_PASSED = 'Date has passed'

/** A goal whose age is before today's age; a legacy is always at the end of the plan. */
export const hasPassed = (goal: Goal, age: number | null) =>
  goal.kind !== 'legacy' && goal.age < (age ?? 0)

/** The calendar year a goal falls in. */
export const goalYear = (goal: Goal, plan: WhenInputs) =>
  assumption(plan, 'startYear') + goal.age - (plan.about.age ?? 0)

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`

export function goalWhen(goal: Goal, plan: WhenInputs) {
  const years = goal.age - (plan.about.age ?? 0)
  if (goal.kind === 'legacy') {
    const planEnd = isChosen(plan.asm, 'planEnd') ? ` (${assumption(plan, 'planEnd')})` : ''
    return `At the end of your plan${planEnd}`
  }
  if (hasPassed(goal, plan.about.age)) return DATE_PASSED
  const when =
    goal.kind !== 'retire'
      ? `in ${plural(years, 'yr')} · age ${goal.age}`
      : plan.retireSet
        ? `Age ${goal.age}`
        : 'Age not chosen yet'
  return `${when} · ${goalYear(goal, plan)}`
}

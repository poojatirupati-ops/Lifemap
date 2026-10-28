// "Add to my plan" from a calculator: what the result would add, and adding it.
import type { Handoff } from '../components/calc/types.ts'
import { years } from '../components/calc/words.ts'
import { retirementRange } from '../components/finance/choiceActions.ts'
import { newGoal, retirementGoal } from '../domain/goals/goals.ts'
import { assumption } from '../domain/planning/assumptions.ts'
import { clamp } from '../components/calc/maths.ts'
import { euro } from '../lib/format.ts'
import type { Plan } from '../state/types.ts'

// TODO(R-31): penExtra and needs belong in Plan (src/state/types.ts)
type HandoffPlan = Plan & { penExtra?: number; needs?: Record<string, number> }

const BUTTONS: Record<string, string> = {
  retire: 'Update it',
  pension: 'Raise it',
  need: 'Note it',
}
export const buttonFor = (goal: Handoff) => BUTTONS[goal.kind] ?? 'Add it'

/** One sentence on what adding this result does to the plan. */
export function describeHandoff(goal: Handoff, age: number) {
  const amount = euro(goal.amount ?? 0)
  const yearsAway = Math.max(1, goal.years ?? 0)
  const when = ` in about ${years(yearsAway)} (age ${age + yearsAway})`
  switch (goal.kind) {
    case 'retire':
      return `Your retirement goal becomes ${amount} a year from age ${goal.age}. No new goal is added.`
    case 'pension':
      return `Your plan's pension contribution goes up by ${amount} a month. Pension money is not a spending goal.`
    case 'need': {
      const cover = goal.need === 'life' ? 'a life cover' : 'an income protection'
      const perMonth = goal.need === 'ip' ? ' a month' : ''
      return `We note ${cover} need of ${amount}${perMonth} for your adviser. Cover is bought for a premium; it is not money to save.`
    }
    case 'mfree':
      return `A "Mortgage free" milestone${when}, priced from your mortgage (no cash amount).`
  }
  const what =
    goal.kind === 'safety'
      ? 'An emergency fund (a reserve, not a spend) of '
      : goal.kind === 'pot'
        ? 'A savings pot of '
        : ''
  const saved = goal.saved ? `, with ${euro(goal.saved)} already saved` : ''
  return `${what}${amount} in today's money${when}${saved}.`
}

const goalKey = (goal: Handoff) =>
  goal.kind === 'safety'
    ? 'safety'
    : goal.kind === 'pot'
      ? 'wealth'
      : goal.k === 'home'
        ? 'home'
        : 'other'

/** Change the plan as the result says; returns the message to show. */
export function applyHandoff(draft: Plan, goal: Handoff): string {
  const plan = draft as HandoffPlan
  const age = plan.about.age ?? 0
  const amount = Math.round(goal.amount ?? 0)
  const ageIn = (yearsAway = 0) =>
    Math.min(assumption(plan, 'planEnd'), age + Math.max(1, yearsAway))
  const addGoal = (key: string) => {
    const added = newGoal(plan, plan.gid++, key)
    plan.goals.push(added)
    return added
  }

  if (goal.kind === 'retire') {
    const retirement = retirementGoal(plan.goals) ?? addGoal('retire')
    retirement.amount = amount
    const retireAge = clamp(goal.age ?? 0, age + 1, retirementRange(plan).max)
    plan.retireAge = retireAge
    plan.retireSet = true
    retirement.age = retireAge
    plan.fin.retireAge = retireAge
    plan.src.retireAge ||= 'pre'
    return 'Retirement goal updated'
  }
  if (goal.kind === 'pension') {
    plan.penExtra = Math.round(((plan.penExtra ?? 0) + (goal.amount ?? 0)) * 100) / 100
    return `Pension contribution raised by ${euro(goal.amount ?? 0)} a month`
  }
  if (goal.kind === 'need') {
    plan.needs = { ...plan.needs, [goal.need ?? '']: amount }
    return 'Noted for your adviser'
  }
  if (goal.kind === 'mfree') {
    const milestone = plan.goals.find((g) => g.kind === 'mfree') ?? addGoal('mfree')
    milestone.age = ageIn(goal.years)
    return 'Mortgage free added to your plan'
  }

  const key = goalKey(goal)
  const added =
    key === 'other'
      ? newGoal(plan, plan.gid++, 'other', {
          emoji: goal.em ?? '',
          name: goal.name ?? '',
          amount,
          years: Math.max(1, goal.years ?? 0),
        })
      : newGoal(plan, plan.gid++, key)
  Object.assign(added, {
    name: (goal.name ?? '').replace(/ \(deposit goal\)$/, ''),
    e: goal.em,
    amount,
    auto: false,
    age: ageIn(goal.years),
    saved: Math.round(goal.saved ?? 0),
  })
  plan.goals.push(added)
  return plan.app
    ? `${added.name} added to your plan`
    : `${added.name} added. It will be on your timeline when you make your plan`
}

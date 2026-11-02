// "Add to my plan" from a calculator: what the result would add, and adding it.
import { calculatorFor } from '../calc/calculators.ts'
import { calcContext, toolPlan } from '../calc/context.ts'
import type { Figures, Handoff } from '../calc/types.ts'
import { missingFigures, toolFigures } from '../calc/values.ts'
import { years } from '../calc/words.ts'
import { assumption } from '../planning/assumptions.ts'
import { clamp } from '../../lib/clamp.ts'
import { euro } from '../../lib/format.ts'
import type { Plan } from '../../state/types.ts'
import { newGoal, retirementGoal } from './goals.ts'
import { retirementRange } from './retirement.ts'

/** What a calculator's result would add to the plan, or what it still needs first. */
export function calcHandoff(plan: Plan, toolId: string) {
  const calculator = calculatorFor(toolId)
  const tool = toolPlan(plan, calculator.id)
  const figures = toolFigures(calculator, tool)
  const missing = missingFigures(calculator, figures, plan.assumptions)
  if (missing.length) return { missing, goal: null }
  // what-ifs left blank count as 0
  const result = calculator.run(figures.figures as Figures, calcContext(tool, calculator.id))
  return { missing, goal: result.goal }
}

const BUTTONS: Record<string, string> = {
  retire: 'Update it',
  pension: 'Raise it',
  need: 'Note it',
}
export const buttonFor = (goal: Handoff) => BUTTONS[goal.kind] ?? 'Add it'

const LEAD: Record<string, string> = {
  safety: 'An emergency fund (a reserve, not a spend) of ',
  pot: 'A savings pot of ',
}

const GOAL_KEY: Record<string, string> = { safety: 'safety', pot: 'wealth' }

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
  const what = LEAD[goal.kind] ?? ''
  const saved = goal.saved ? `, with ${euro(goal.saved)} already saved` : ''
  return `${what}${amount} in today's money${when}${saved}.`
}

const goalKey = (goal: Handoff) =>
  GOAL_KEY[goal.kind] ?? (goal.goalKind === 'home' ? 'home' : 'other')

/** Change the plan as the result says; returns the message to show. */
export function applyHandoff(plan: Plan, goal: Handoff): string {
  const age = plan.about.age ?? 0
  const amount = Math.round(goal.amount ?? 0)
  const ageIn = (yearsAway = 0) =>
    Math.min(assumption(plan, 'planEnd'), age + Math.max(1, yearsAway))
  const addGoal = (key: string) => {
    const added = newGoal(plan, plan.nextGoalId++, key)
    plan.goals.push(added)
    return added
  }

  switch (goal.kind) {
    case 'retire': {
      const retirement = retirementGoal(plan.goals) ?? addGoal('retire')
      const retireAge = clamp(goal.age ?? 0, age + 1, retirementRange(plan).max)
      retirement.amount = amount
      retirement.age = retireAge
      plan.retireAge = retireAge
      plan.retireSet = true
      plan.figures.retireAge = retireAge
      plan.sources.retireAge ||= 'pre'
      return 'Retirement goal updated'
    }
    case 'pension':
      plan.pensionExtra = Math.round(((plan.pensionExtra ?? 0) + (goal.amount ?? 0)) * 100) / 100
      return `Pension contribution raised by ${euro(goal.amount ?? 0)} a month`
    case 'need':
      plan.needs = { ...plan.needs, [goal.need ?? '']: amount }
      return 'Noted for your adviser'
    case 'mfree': {
      const milestone = plan.goals.find((g) => g.kind === 'mfree') ?? addGoal('mfree')
      milestone.age = ageIn(goal.years)
      return 'Mortgage free added to your plan'
    }
  }

  const added = newGoal(plan, plan.nextGoalId++, goalKey(goal))
  Object.assign(added, {
    name: (goal.name ?? '').replace(/ \(deposit goal\)$/, ''),
    e: goal.emoji,
    amount,
    auto: false,
    age: ageIn(goal.years),
    saved: Math.round(goal.saved ?? 0),
  })
  plan.goals.push(added)
  return plan.hasResults
    ? `${added.name} added to your plan`
    : `${added.name} added. It will be on your timeline when you make your plan`
}

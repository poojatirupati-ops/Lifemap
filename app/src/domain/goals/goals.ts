// Goals: making a goal, the emergency fund that follows essential spending, the retirement age.
import { goalCategory, type GoalCategory, type OtherGoal } from '../discovery/goals.data.ts'
import { assumption } from '../planning/assumptions.ts'
import { essentialMonthly, householdFigures, type Household } from '../planning/householdFigures.ts'
import { rulesFor } from '../planning/rates.ts'
import type { Goal, Plan } from '../../state/types.ts'

/** What a new goal reads besides the household: which figures are in. */
export type GoalInputs = Household & Pick<Plan, 'src'>

/** Essential spending a month: living costs, mortgage and debt repayments, as the cashflow card. */
export const essentialSpending = (household: Household) =>
  essentialMonthly(householdFigures(household, rulesFor(assumption(household, 'startYear'))))

/** Months x essential spending, not rounded to 1,000, so the amount and the months agree. */
export const safetyAmount = (household: Household) =>
  Math.round(essentialSpending(household) * assumption(household, 'safetyMonths'))

export function newGoal(plan: GoalInputs, id: number, key: string, other?: OtherGoal): Goal {
  const category = goalCategory(key)
  if (!category) throw new Error(`unknown goal ${key}`)
  return {
    id,
    k: key,
    name: other?.name ?? category.title,
    e: other?.emoji ?? category.emoji,
    kind: category.kind,
    spec: category.specialist,
    amount: goalAmount(plan, category, other),
    saved: 0,
    who: 'Me',
    prio: 'Must have',
    flex: 'Can move',
    age: goalAge(plan, category, other),
    ...(key === 'safety' && { auto: true }),
  }
}

function goalAmount(plan: GoalInputs, category: GoalCategory, other?: OtherGoal) {
  const children = plan.about.deps ?? 0
  // until their costs are in, the emergency fund keeps its own target
  if (category.key === 'safety' && plan.src?.costsM) return safetyAmount(plan)
  if (category.key === 'edu' && children > 1) return category.amount * Math.min(3, children)
  return other?.amount ?? category.amount
}

function goalAge(plan: GoalInputs, category: GoalCategory, other?: OtherGoal) {
  if (category.kind === 'retire') return plan.retireAge
  // a legacy is tested and shown at the end of the plan
  if (category.kind === 'legacy') return assumption(plan, 'planEnd')
  const years = other?.years ?? category.years ?? 0
  return Math.min(89, (plan.about.age ?? 0) + years)
}

export const retirementGoal = (goals: Goal[]) => goals.find((g) => g.kind === 'retire')

/** The plan-wide emergency fund months, as set in the goal or the calculator. */
export const clampSafetyMonths = (months: number) => Math.max(1, Math.min(12, Math.round(months)))

/** The retirement goal moves with the retirement age. */
export const goalsRetiringAt = (goals: Goal[], age: number) =>
  goals.map((goal) => (goal.kind === 'retire' ? { ...goal, age } : goal))

type EmergencyInputs = GoalInputs &
  Pick<Plan, 'app' | 'goals' | 'safetyOff' | 'safetyWanted' | 'fin'>

/**
 * Emergency fund first (v3.0): with cash and living costs given and cash below the target months,
 * an emergency fund goal is added; once removed, never again. Returns the goal to add, if any.
 */
export function emergencyFundToAdd(plan: EmergencyInputs, id: number): Goal | null {
  if (!plan.app || plan.safetyOff || !plan.src) return null
  if (plan.goals.some((g) => g.k === 'safety')) return null
  const spending = plan.src.costsM ? essentialSpending(plan) : 0
  const target = assumption(plan, 'safetyMonths') * spending
  const cash = Number(plan.fin.cash) || 0
  const enoughCash = !plan.src.cash || spending <= 0 || cash >= target - 0.5
  if (!plan.safetyWanted && enoughCash) return null
  return { ...newGoal(plan, id, 'safety'), autoAdded: !plan.safetyWanted }
}

// Goals: making a goal, the emergency fund that follows essential spending, the retirement age.
import { goalCategory, type GoalCategory, type OtherGoal } from '../discovery/goals.data.ts'
import { assumption } from '../planning/assumptions.ts'
import { essentialMonthly, householdFigures, type Household } from '../planning/householdFigures.ts'
import { rulesFor } from '../planning/rates.ts'
import { clamp } from '../../lib/clamp.ts'
import type { Goal, Plan } from '../../state/types.ts'

/** What a new goal reads besides the household: which figures are in. */
export type GoalInputs = Household & Pick<Plan, 'sources'>

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
    key,
    name: other?.name ?? category.title,
    emoji: other?.emoji ?? category.emoji,
    kind: category.kind,
    spec: category.specialist,
    amount: goalAmount(plan, category, other),
    saved: 0,
    who: 'Me',
    priority: 'Must have',
    flex: 'Can move',
    age: goalAge(plan, category, other),
    ...(key === 'safety' && { auto: true }),
  }
}

function goalAmount(plan: GoalInputs, category: GoalCategory, other?: OtherGoal) {
  const children = plan.about.dependants ?? 0
  // until their costs are in, the emergency fund keeps its own target
  if (category.key === 'safety' && plan.sources?.costsM) return safetyAmount(plan)
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
export const clampSafetyMonths = (months: number) => clamp(Math.round(months), 1, 12)

type AgeInputs = Pick<Plan, 'about' | 'assumptions' | 'figures'>

/** Retirement can be set up to the year before the plan ends. */
const latestRetirement = (plan: AgeInputs) =>
  Math.max((plan.about.age ?? 0) + 1, assumption(plan, 'planEnd') - 1)

/** A goal can sit from next year to the end of the plan. */
export function ageLimits(plan: AgeInputs, goal: Goal) {
  const earliest = (plan.about.age ?? 0) + 1
  const latest = goal.kind === 'retire' ? latestRetirement(plan) : assumption(plan, 'planEnd')
  return { earliest, latest }
}

type EmergencyInputs = GoalInputs &
  Pick<Plan, 'hasResults' | 'goals' | 'safetyOff' | 'safetyWanted' | 'figures'>

/**
 * Emergency fund first (v3.0): with cash and living costs given and cash below the target months,
 * an emergency fund goal is added; once removed, never again. Returns the goal to add, if any.
 * TODO(R-11): project applies it (the original's autoSafety); TODO(R-13): wantEmergencyFund in the app.
 */
export function emergencyFundToAdd(plan: EmergencyInputs, id: number): Goal | null {
  if (!plan.hasResults || plan.safetyOff || !plan.sources) return null
  if (plan.goals.some((g) => g.key === 'safety')) return null
  const spending = plan.sources.costsM ? essentialSpending(plan) : 0
  const target = assumption(plan, 'safetyMonths') * spending
  const cash = Number(plan.figures.cash) || 0
  const enoughCash = !plan.sources.cash || spending <= 0 || cash >= target - 0.5
  if (!plan.safetyWanted && enoughCash) return null
  return { ...newGoal(plan, id, 'safety'), autoAdded: !plan.safetyWanted }
}

/** Be mortgage-free can be picked only by a homeowner with a mortgage (or when no home is set). */
export const canPickGoal = (key: string, home: string | null | undefined, picked: boolean) =>
  key !== 'mfree' || picked || !home || home === 'Own with mortgage'

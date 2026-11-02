// The plan year by year, from the first plan year to the plan end, and how well each goal is covered.
import type { Goal } from '../../state/types'
import { downsize, payOffMortgage, repayDebts } from './balances'
import { coveredPercent, goalFunding, ruleSaving } from './fund'
import { payDueGoals, splitSpare, type SavingPlan, type YearContext } from './fundYear'
import type { HouseholdFigures } from './householdFigures'
import { yearIncome } from './income'
import { planSettings, type ProjectionInputs } from './planSettings'
import { startingPosition } from './startingPosition'
import { growWallet, walletTotal } from './wallet'
import type { WhatIf } from './wi'

const NO_WHAT_IF: WhatIf = { goalId: null, monthly: 0, lumpSum: 0 }

type Coverage = Map<number, { cost: number; covered: number }>

/** A retired year short of more than €500 (or 2% of what it needs). */
export const livingShort = (row: { livingShortfall: number; needs: number }) =>
  row.livingShortfall > Math.max(500, row.needs * 0.02)

export type YearRow = ReturnType<typeof project>['rows'][number]

/** The plan's rows plus each goal's covered percent and funding, and this year's saving. */
export function project(inputs: ProjectionInputs, whatIf: WhatIf = NO_WHAT_IF) {
  const plan = planSettings(inputs)
  const { figures, growth } = plan
  const startAge = figures.age ?? 0
  const retirement = inputs.goals.find((goal) => goal.kind === 'retire')
  const legacies = inputs.goals.filter((goal) => goal.kind === 'legacy')
  const { pots, wallet, balances, target, towardsPension } = startingPosition(plan, inputs, whatIf)
  const coverage: Coverage = new Map(inputs.goals.map((goal) => [goal.id, { cost: 0, covered: 0 }]))
  const saving: Omit<SavingPlan, 'ruleToday'> = {
    choice: {
      answer: inputs.answers['6'],
      saveM: inputs.monthlySaving,
      saveUp: inputs.savingAtRule,
    },
    rules: plan.saving,
    less: towardsPension ? 0 : Math.min(0, whatIf.monthly),
    more: towardsPension ? 0 : Math.max(0, whatIf.monthly),
    target,
  }
  const pensionWhatIf = towardsPension ? whatIf.monthly : null
  const rows = []
  let ruleToday = 0
  for (let index = 0; index <= plan.end - startAge; index++) {
    const age = startAge + index
    const prices = (1 + growth.inflation) ** index
    const working = age < figures.retireAge
    const year: YearContext = {
      index,
      age,
      first: index === 0,
      prices,
      payRise: growth.wage,
      working,
    }
    const income = yearIncome(plan, balances, wallet, year, pensionWhatIf)
    const yearlySpending = working ? figures.monthlyCosts * 12 : retiredSpending(plan, retirement)
    const living = yearlySpending * prices + figures.yearlyOneOffs * prices
    wallet.held.cash += policyLumpSum(figures, age)
    const downsized = downsize(plan, balances, age, prices)
    wallet.held.cash += downsized
    const repayments = repayDebts(figures, balances)
    const due = payDueGoals(pots, wallet, age)
    payOffMortgage(balances, due)
    const spare = income.inflow - living - repayments
    if (index === 0)
      ruleToday = ruleSaving(Math.max(0, spare) / 12, saving.choice.answer, plan.saving)
    const split = splitSpare(pots, wallet, spare, year, { ...saving, ruleToday })
    growWallet(wallet, growth)
    for (const pot of pots) if (!pot.done) pot.pot *= 1 + pot.rate
    const free = walletTotal(wallet) + wallet.emergency
    for (const pot of due) coverage.set(pot.goal.id, { cost: pot.cost, covered: pot.paid })
    if (retirement && !working) addRetiredYear(coverage, retirement, living, split.livingShortfall)
    if (age === plan.end) coverLegacies(coverage, legacies, prices, free)
    const goalGap = due.reduce((total, pot) => total + pot.cost - pot.paid, 0)
    rows.push({
      index,
      age,
      year: plan.startYear + index,
      ...income,
      living,
      repayments,
      needs: living + repayments,
      goalsDue: due.map(({ goal, cost, paid }) => ({ ...dueGoal(goal), cost, paid })),
      goalCost: due.reduce((total, pot) => total + pot.cost, 0),
      goalGap,
      ...split,
      shortfall: split.livingShortfall + goalGap,
      liquid: free + pots.reduce((total, pot) => total + pot.pot, 0),
      pension: balances.pension,
      retired: !working,
      retiresThisYear: age === figures.retireAge,
      downsized,
    })
  }

  const percent: Record<number, number> = {}
  for (const [id, { cost, covered }] of coverage) percent[id] = coveredPercent(cost, covered)
  if (retirement && rows.some((row) => row.retired && livingShort(row)))
    percent[retirement.id] = Math.min(percent[retirement.id], 94)
  // the road's colours follow the percent
  const shortAges = new Set(
    pots.filter((pot) => percent[pot.goal.id] < 95).map((pot) => pot.goal.age),
  )
  const first = rows[0]
  return {
    rows: rows.map((row) => ({ ...row, goalShort: shortAges.has(row.age) })),
    percent,
    goals: Object.fromEntries(pots.map((pot) => [pot.goal.id, goalFunding(pot)])),
    saving: {
      spareMonthly: Math.round(startAge < figures.retireAge ? (first.saved + first.spent) / 12 : 0),
      savingMonthly: Math.round(first.saved / 12),
      ruleMonthly: ruleToday,
    },
  }
}

const dueGoal = ({ id, name, emoji, kind }: Goal) => ({ id, name, e: emoji, kind })

const retiredSpending = (plan: { figures: HouseholdFigures; retireSpend: number }, goal?: Goal) =>
  goal ? goal.amount : plan.figures.monthlyCosts * 12 * plan.retireSpend

function policyLumpSum(figures: HouseholdFigures, age: number) {
  const { policyLumpSum: amount, policyLumpSumAge: paidAt } = figures
  return amount > 0 && paidAt > 0 && age === paidAt ? amount : 0
}

/** Each retired year, retirement costs what is lived on and covers what was not short. */
function addRetiredYear(coverage: Coverage, retirement: Goal, living: number, short: number) {
  const retired = coverage.get(retirement.id)!
  retired.cost += living
  retired.covered += living - Math.min(short, living)
}

/** At the plan end, a legacy is covered by the money left. */
function coverLegacies(coverage: Coverage, legacies: Goal[], prices: number, free: number) {
  for (const goal of legacies) {
    const wanted = goal.amount * prices
    coverage.set(goal.id, { cost: wanted, covered: Math.min(wanted, free) })
  }
}

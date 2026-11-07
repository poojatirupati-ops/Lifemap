// The plan year by year, from the first plan year to the plan end, and how well each goal is covered.
import type { Goal } from '../../state/types'
import { downsize, payOffMortgage, repayDebts } from './balances'
import { coveredPercent, goalFunding, ruleSaving, type GoalPot } from './fund'
import {
  STRESS_FALL,
  grownBy,
  payDueGoals,
  splitSpare,
  type SavingPlan,
  type YearContext,
} from './fundYear'
import type { HouseholdFigures } from './householdFigures'
import { yearIncome } from './income'
import type { Holdings } from './holdings'
import { planSettings, type PlanSettings, type ProjectionInputs } from './planSettings'
import { startingPosition } from './startingPosition'
import { growWallet, holdingValue, noneSold, walletTotal, type Wallet } from './wallet'
import type { WhatIf } from './wi'

const NO_WHAT_IF: WhatIf = { goalId: null, monthly: 0, lumpSum: 0 }

type Coverage = Map<number, { cost: number; covered: number }>

/** A retired year short of more than €500 (or 2% of what it needs). */
export const livingShort = (row: { livingShortfall: number; needs: number }) =>
  row.livingShortfall > Math.max(500, row.needs * 0.02)

export type YearRow = ReturnType<typeof project>['rows'][number]

/**
 * The plan's rows plus each goal's covered percent and funding, this year's saving, the tax figures
 * each year used and the exit and capital gains tax over the plan. A what-if with `stress` is the
 * stress test's side run.
 */
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
  const { assets } = wallet
  const stressYear = Math.max(0, figures.retireAge - 1 - startAge)
  const rows = []
  const taxUsed = []
  let ruleToday = 0
  for (let index = 0; index <= plan.end - startAge; index++) {
    const age = startAge + index
    const prices = (1 + growth.inflation) ** index
    const working = age < figures.retireAge
    const stressed = !!whatIf.stress && index === stressYear
    const year: YearContext = {
      index,
      age,
      first: index === 0,
      prices,
      payRise: growth.wage,
      working,
      stressed,
    }
    assets.startYear(plan.startYear + index)
    wallet.sold = noneSold()
    taxUsed.push(taxFigures(plan, assets, plan.startYear + index, prices))
    const { cashflow, ...income } = yearIncome(plan, balances, wallet, year, pensionWhatIf)
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
    const dirt = dirtOnInterest(plan, wallet, pots)
    const investGrowth = plan.deemedDisposal ? plan.investGrowthBeforeTax : growth.invest
    growWallet(wallet, growth.cash, stressed ? -STRESS_FALL : investGrowth)
    for (const pot of pots) {
      const invested = pot.rate === growth.invest && growth.invest !== growth.cash
      if (!pot.done) pot.pot *= grownBy(stressed && invested, pot.rate)
    }
    const potsTotal = pots.reduce((total, pot) => total + pot.pot, 0)
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
      liquid: free + potsTotal,
      pension: balances.pension,
      retired: !working,
      retiresThisYear: age === figures.retireAge,
      downsized,
      exitTaxDeemed: assets.thisYear.deemed,
      taxOnSales: assets.thisYear.sale,
      cashflow: {
        dirt,
        ...cashflow,
        sold: { ...wallet.sold },
        balances: { ...holdingBalances(wallet), emergency: wallet.emergency, pots: potsTotal },
      },
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
    taxUsed,
    taxEvents: assets.wholePlan,
    saving: {
      spareMonthly: Math.round(startAge < figures.retireAge ? (first.saved + first.spent) / 12 : 0),
      savingMonthly: Math.round(first.saved / 12),
      ruleMonthly: ruleToday,
    },
  }
}

const dueGoal = ({ id, name, emoji, kind }: Goal) => ({ id, name, e: emoji, kind })

/** The tax figures a plan year uses, kept with the plan. */
function taxFigures(plan: PlanSettings, assets: Holdings, year: number, prices: number) {
  const { rules, taxYear, flatBands } = plan
  return {
    year,
    taxYear,
    band: rules.it.band,
    personalCredit: rules.it.personal,
    usc2Band: rules.usc.bands[1][0],
    statePensionWeek: rules.sp.week,
    exitTax: rules.sav.exit,
    cgtRate: assets.gains.rate,
    cgtExemption: assets.gains.exemptionLeft,
    bandsIndex: flatBands ? 1 : prices,
  }
}

/** The DIRT that came off this year's interest (the cash rate is after DIRT): a memo, not a cost. */
function dirtOnInterest({ rules, growth }: PlanSettings, wallet: Wallet, pots: GoalPot[]) {
  const inCashPots = pots
    .filter((pot) => !pot.done && pot.rate === growth.cash)
    .reduce((total, pot) => total + Math.max(0, pot.pot), 0)
  const atCashRate =
    wallet.held.cash + wallet.held.savings + Math.max(0, wallet.emergency) + inCashPots
  return (atCashRate * growth.cash * rules.sav.dirt) / (1 - rules.sav.dirt)
}

const holdingBalances = (wallet: Wallet) => ({
  cash: wallet.held.cash,
  savings: wallet.held.savings,
  invest: holdingValue(wallet, 'invest'),
  otherAssets: holdingValue(wallet, 'otherAssets'),
  alternatives: holdingValue(wallet, 'alternatives'),
})

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

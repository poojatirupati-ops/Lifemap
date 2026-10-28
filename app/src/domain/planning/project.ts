// The plan year by year, from the first plan year to the plan end, and how well each goal is covered.
import type { Goal } from '../../state/types'
import { downsize, repayDebts } from './balances'
import * as fund from './fund'
import { coverShortfall, payDueGoals, saveExtra, saveForGoals } from './fundYear'
import { incomes } from './income'
import { planSettings, type ProjectionInputs } from './planSettings'
import { startingPosition } from './startingPosition'
import { deposit, growWallet, walletTotal } from './wallet'
import type { WhatIf } from './wi'

const NO_WHAT_IF: WhatIf = { goalId: null, monthly: 0, lumpSum: 0 }

/** A retired year short of more than €500 (or 2% of what it needs). */
export const livingShort = (row: { livingShortfall: number; needs: number }) =>
  row.livingShortfall > Math.max(500, row.needs * 0.02)

/** Yields one row per plan year; returns what the results need. */
export function* projectYears(inputs: ProjectionInputs, whatIf: WhatIf = NO_WHAT_IF) {
  const plan = planSettings(inputs)
  const { figures: f, growth } = plan
  const startAge = f.age ?? 0
  const retirement = inputs.goals.find((goal) => goal.kind === 'retire')
  const { pots, wallet, balances, target, towardsPension } = startingPosition(plan, inputs, whatIf)
  const coverage = new Map(inputs.goals.map((goal) => [goal.id, { cost: 0, covered: 0 }]))
  const choice = { answer: inputs.ans['6'], saveM: inputs.saveM, saveUp: inputs.saveUp }
  const savingLess = towardsPension ? 0 : Math.min(0, whatIf.monthly)
  const savingMore = towardsPension ? 0 : Math.max(0, whatIf.monthly)
  let ruleToday = 0
  for (let index = 0; index <= plan.end - startAge; index++) {
    const age = startAge + index
    const prices = (1 + growth.inflation) ** index
    const working = age < f.retireAge
    const year = { age, first: index === 0, prices, payRise: growth.wage }
    const income = incomes(plan, balances, wallet, index, towardsPension ? whatIf.monthly : null)
    const retiredSpending = retirement ? retirement.amount : f.monthlyCosts * 12 * plan.retireSpend
    const living =
      (working ? f.monthlyCosts * 12 : retiredSpending) * prices + f.yearlyOneOffs * prices
    const policyPaysOut =
      f.policyLumpSum > 0 && f.policyLumpSumAge > 0 && age === f.policyLumpSumAge
    const policyLumpSum = policyPaysOut ? f.policyLumpSum : 0
    wallet.held.cash += policyLumpSum
    const downsized = downsize(plan, balances, age, prices)
    wallet.held.cash += downsized
    const repayments = repayDebts(f, balances)

    const due = payDueGoals(pots, wallet, age)
    for (const pot of due) {
      coverage.set(pot.goal.id, { cost: pot.cost, covered: pot.paid })
      if (pot.goal.kind !== 'mfree') continue
      if (pot.paid >= pot.cost - 1) balances.mortgageCleared = true
      balances.mortgage = balances.mortgageCleared ? 0 : Math.max(0, balances.mortgage - pot.paid)
    }

    const spare = income.inflow - living - repayments
    if (index === 0)
      ruleToday = fund.ruleSaving(Math.max(0, spare) / 12, choice.answer, plan.saving)
    let saved = 0
    let spent = 0
    let drawnFromSavings = 0
    let livingShortfall = 0
    if (spare >= 0) {
      const rule = working ? fund.savingCap(spare / 12 / prices, ruleToday, choice, plan.saving) : 0
      const less = working ? savingLess * 12 * prices : 0
      const budget = Math.min(Math.max(0, rule * 12 * prices + less), spare)
      const more = working && target && !target.done ? savingMore * 12 * prices : 0
      const extra = Math.min(more, spare - budget)
      saved = budget + extra
      spent = spare - saved
      if (extra > 0) saveExtra(target!, wallet, extra, year)
      saveForGoals(pots, wallet, budget, year)
      // retired income above the spending goal stays in savings
      if (!working) {
        deposit(wallet, spent)
        saved += spent
        spent = 0
      }
    } else {
      const covered = coverShortfall(pots, wallet, -spare, year)
      drawnFromSavings = covered.used
      livingShortfall = covered.short
    }

    growWallet(wallet, growth)
    for (const pot of pots) if (!pot.done) pot.pot *= 1 + pot.rate
    const free = walletTotal(wallet) + wallet.emergency
    if (retirement && !working) {
      const retired = coverage.get(retirement.id)!
      retired.cost += living
      retired.covered += living - Math.min(livingShortfall, living)
    }
    if (age === plan.end)
      for (const goal of inputs.goals.filter((goal) => goal.kind === 'legacy')) {
        const wanted = goal.amount * prices
        coverage.set(goal.id, { cost: wanted, covered: Math.min(wanted, free) })
      }
    const goalCost = due.reduce((total, pot) => total + pot.cost, 0)
    const goalPaid = due.reduce((total, pot) => total + (pot.goal.kind === 'pot' ? 0 : pot.paid), 0)
    const goalGap = due.reduce((total, pot) => total + pot.cost - pot.paid, 0)
    yield {
      index,
      age,
      year: plan.startYear + index,
      ...income,
      living,
      repayments,
      needs: living + repayments,
      goalsDue: due.map(({ goal, cost, paid }) => ({ ...pick(goal), cost, paid })),
      dueNames: due.map((pot) => pot.goal.name),
      goalCost,
      goalPaid,
      goalGap,
      livingShortfall,
      shortfall: livingShortfall + goalGap,
      drawnFromSavings,
      saved,
      spent,
      liquid: free + pots.reduce((total, pot) => total + pot.pot, 0),
      pension: balances.pension,
      retired: !working,
      retiresThisYear: age === f.retireAge,
      policyLumpSum,
      downsized,
      goalShort: false,
    }
  }
  return { coverage, pots, retirement, startAge, ruleToday, working: startAge < f.retireAge }
}

const pick = ({ id, name, e, kind }: Goal) => ({ id, name, e, kind })

export type YearRow = ReturnType<typeof project>['rows'][number]

/** The plan's rows plus each goal's covered percent and funding, and this year's saving. */
export function project(inputs: ProjectionInputs, whatIf?: WhatIf) {
  const years = projectYears(inputs, whatIf)
  const rows = []
  let step = years.next()
  for (; !step.done; step = years.next()) rows.push(step.value)
  const { coverage, pots, retirement, startAge, ruleToday, working } = step.value
  const percent: Record<number, number> = {}
  for (const [id, { cost, covered }] of coverage) percent[id] = fund.coveredPercent(cost, covered)
  // the road's colours follow the percent
  for (const pot of pots)
    if (percent[pot.goal.id] < 95 && rows[pot.goal.age - startAge])
      rows[pot.goal.age - startAge].goalShort = true
  if (retirement && rows.some((row) => row.retired && livingShort(row)))
    percent[retirement.id] = Math.min(percent[retirement.id], 94)
  const first = rows[0]
  return {
    rows,
    percent,
    goals: Object.fromEntries(pots.map((pot) => [pot.goal.id, fund.goalFunding(pot)])),
    saving: {
      spareMonthly: Math.round(working ? (first.saved + first.spent) / 12 : 0),
      savingMonthly: Math.round(first.saved / 12),
      ruleMonthly: ruleToday,
    },
  }
}

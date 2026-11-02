// Where the plan starts: goal costs and pots, today's money spread over the goals, the balances.
import type { Goal } from '../../state/types'
import type { Balances } from './balances'
import { fundingOrder, isSafety, newPot, SAVED_FOR_KINDS } from './fund'
import { essentialMonthly, type HouseholdFigures } from './householdFigures'
import { repayForYear } from './loans'
import type { PlanSettings, ProjectionInputs } from './planSettings'
import { EASY_ACCESS, HOLDINGS, sell, type Wallet } from './wallet'
import type { WhatIf } from './wi'

/** The mortgage balance at the start of each plan year. */
function mortgageBalances(figures: HouseholdFigures, years: number) {
  const balances = []
  let balance = figures.mortgageBalance
  for (let year = 0; year < years; year++) {
    balances.push(Math.max(0, balance))
    if (balance > 1)
      balance = repayForYear(balance, figures.mortgageRate, figures.monthlyMortgage).balance
  }
  return balances
}

function goalCost(goal: Goal, years: number, plan: PlanSettings, mortgage: number[]) {
  const inflated = goal.amount * (1 + plan.growth.inflation) ** years
  if (goal.kind !== 'mfree' || plan.figures.mortgageBalance <= 0) return inflated
  return mortgage[Math.min(years + 1, mortgage.length - 1)]
}

/** Today's money: each goal's own savings first, an emergency buffer held back, the rest in goal order. */
export function startingPosition(plan: PlanSettings, inputs: ProjectionInputs, whatIf: WhatIf) {
  const { figures, end } = plan
  const startAge = figures.age ?? 0
  const mortgagePath = mortgageBalances(figures, end - startAge + 1)
  const saved = inputs.goals
    .filter((goal) => SAVED_FOR_KINDS.includes(goal.kind))
    .map((goal) => ({ ...goal, age: Math.max(startAge + 1, Math.min(end, goal.age)) }))
  const pots = fundingOrder(saved, inputs.rank).map((goal) => {
    const years = Math.max(0, goal.age - startAge)
    const rate = years >= plan.cashYears ? plan.growth.invest : plan.growth.cash
    return newPot(goal, years, rate, goalCost(goal, years, plan, mortgagePath))
  })
  const wallet: Wallet = {
    held: {
      cash: figures.cash,
      savings: figures.savings,
      invest: figures.invest,
      otherAssets: figures.otherAssets,
      alternatives: figures.alternativeInvestments,
    },
    emergency: 0,
    gainsTax: plan.gainsTax,
    investShare: plan.investShare,
  }
  for (const pot of pots) {
    pot.savedSoFar = Math.min(pot.goal.saved || 0, wallet.held.cash)
    pot.pot += pot.savedSoFar
    wallet.held.cash -= pot.savedSoFar
  }
  const target = pots.find((pot) => pot.goal.id === whatIf.goalId)
  if (target) target.pot += whatIf.lumpSum
  const towardsPension = inputs.goals.find((goal) => goal.id === whatIf.goalId)?.kind === 'retire'
  if (!pots.some((pot) => isSafety(pot.goal))) {
    wallet.emergency = Math.min(wallet.held.cash, plan.bufferMonths * essentialMonthly(figures))
    wallet.held.cash -= wallet.emergency
  }
  for (const pot of pots) {
    const wanted = Math.max(0, pot.cost / (1 + pot.rate) ** pot.years - pot.pot)
    const from = isSafety(pot.goal) ? EASY_ACCESS : HOLDINGS
    pot.pot += sell(wallet, wanted, from, pot.fromAssets)
  }
  const balances: Balances = {
    pension: figures.pension + (towardsPension ? whatIf.lumpSum : 0),
    mortgage: figures.mortgageBalance,
    card: figures.cardBalance,
    loan: figures.loanBalance,
    mortgageCleared: false,
  }
  return { pots, wallet, balances, target, towardsPension }
}

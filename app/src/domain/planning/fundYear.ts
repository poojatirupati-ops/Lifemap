// One year of goal funding: goals due are paid, spare money is saved, a short year is covered.
import {
  isSafety,
  savingCap,
  yearlyNeed,
  type GoalPot,
  type SavingChoice,
  type SavingRules,
} from './fund'
import { HOLDINGS, deposit, sell, type Wallet } from './wallet'

/** Where a year sits in the plan, for saving that rises with pay. */
export interface YearContext {
  index: number
  age: number
  first: boolean
  prices: number
  payRise: number
  working: boolean
}

/** How spare money is saved: the Q6 rule, the customer's own choice and a what-if. */
export interface SavingPlan {
  /** this year's Q6 rule, today's money a month */
  ruleToday: number
  choice: SavingChoice
  rules: SavingRules
  /** a what-if saving less, today's money a month (0 or negative) */
  less: number
  /** a what-if's extra towards `target`, today's money a month */
  more: number
  target?: GoalPot
}

/** Goals reaching their date are paid from their pot, then from unallocated money. */
export function payDueGoals(pots: GoalPot[], wallet: Wallet, age: number) {
  const due = pots.filter((pot) => !pot.done && pot.goal.age <= age)
  for (const pot of due) {
    pot.done = true
    if (pot.goal.kind === 'pot') {
      // the emergency fund stays as the buffer; a wealth pot becomes free money
      pot.paid = Math.min(pot.cost, pot.pot)
      if (isSafety(pot.goal)) wallet.emergency += pot.pot
      else deposit(wallet, pot.pot)
    } else {
      const fromPot = Math.min(pot.cost, pot.pot)
      pot.paid = fromPot + sell(wallet, pot.cost - fromPot, HOLDINGS, pot.fromAssetsWhenDue)
      deposit(wallet, pot.pot - fromPot)
    }
    pot.pot = 0
  }
  return due
}

/**
 * Spare money: a what-if's extra goes to its goal, the saving budget to goals in order, the rest is
 * spent (retired, it stays in savings). A short year is covered from savings instead.
 */
export function splitSpare(
  pots: GoalPot[],
  wallet: Wallet,
  spare: number,
  year: YearContext,
  saving: SavingPlan,
) {
  if (spare < 0) {
    const { used, short } = coverShortfall(pots, wallet, -spare, year)
    return { saved: 0, spent: 0, drawnFromSavings: used, livingShortfall: short }
  }
  const { working, prices } = year
  const rule = working
    ? savingCap(spare / 12 / prices, saving.ruleToday, saving.choice, saving.rules)
    : 0
  const less = working ? saving.less * 12 * prices : 0
  const budget = Math.min(Math.max(0, rule * 12 * prices + less), spare)
  const target = working && saving.target && !saving.target.done ? saving.target : undefined
  const extra = target ? Math.min(saving.more * 12 * prices, spare - budget) : 0
  if (target && extra > 0) saveExtra(target, wallet, extra, year)
  saveForGoals(pots, wallet, budget, year)
  const saved = budget + extra
  const spent = spare - saved
  if (working) return { saved, spent, drawnFromSavings: 0, livingShortfall: 0 }
  // retired income above the spending goal stays in savings
  deposit(wallet, spent)
  return { saved: saved + spent, spent: 0, drawnFromSavings: 0, livingShortfall: 0 }
}

/** This year's saving goes to goals in order, each taking what keeps it on track; the rest is unallocated. */
function saveForGoals(pots: GoalPot[], wallet: Wallet, budget: number, year: YearContext) {
  for (const pot of pots) {
    if (pot.done) continue
    const need = needThisYear(pot, year)
    const given = Math.min(budget, need)
    if (year.first) {
      pot.neededFirstYear = need
      pot.savedFirstYear += given
    }
    pot.pot += given
    pot.savedReal += given / year.prices
    pot.yearsSaving++
    budget -= given
  }
  deposit(wallet, budget)
}

/** A what-if's extra saving towards one goal, up to what it needs; the rest is unallocated. */
function saveExtra(pot: GoalPot, wallet: Wallet, extra: number, year: YearContext) {
  const given = Math.min(extra, needThisYear(pot, year))
  pot.pot += given
  pot.savedReal += given / year.prices
  deposit(wallet, extra - given)
  if (year.first) pot.savedFirstYear += given
}

/** A short year is covered by unallocated money, the emergency fund, then goal pots (latest first). */
function coverShortfall(pots: GoalPot[], wallet: Wallet, shortfall: number, year: YearContext) {
  for (const pot of pots) {
    if (pot.done) continue
    pot.yearsSaving++
    if (year.first) pot.neededFirstYear = needThisYear(pot, year)
  }
  let short = shortfall
  let used = 0
  const take = (available: number) => {
    const taken = Math.min(short, Math.max(0, available))
    short -= taken
    used += taken
    return taken
  }
  for (const holding of HOLDINGS) wallet.held[holding] -= take(wallet.held[holding])
  wallet.emergency -= take(wallet.emergency)
  for (const pot of pots.toReversed()) {
    if (short <= 0) break
    if (!pot.done) pot.pot -= take(pot.pot)
  }
  return { used, short }
}

const needThisYear = (pot: GoalPot, year: YearContext) =>
  yearlyNeed(pot, pot.goal.age - year.age, year.payRise)

// One year of goal funding: goals due are paid, spare money is saved, a short year is covered.
import { isSafety, yearlyNeed, type GoalPot } from './fund'
import { HOLDINGS, deposit, sell, type Wallet } from './wallet'

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

/** This year's saving goes to goals in order, each taking what keeps it on track; the rest is unallocated. */
export function saveForGoals(pots: GoalPot[], wallet: Wallet, budget: number, year: YearContext) {
  for (const pot of pots) {
    if (pot.done) continue
    const need = yearlyNeed(pot, pot.goal.age - year.age, year.payRise)
    const given = Math.min(budget, need)
    if (year.first) pot.neededFirstYear = need
    if (year.first) pot.savedFirstYear += given
    pot.pot += given
    pot.savedReal += given / year.prices
    pot.savedFromSpare += given
    pot.yearsSaving++
    budget -= given
  }
  deposit(wallet, budget)
}

/** A what-if's extra saving towards one goal, up to what it needs; the rest is unallocated. */
export function saveExtra(pot: GoalPot, wallet: Wallet, extra: number, year: YearContext) {
  const given = Math.min(extra, yearlyNeed(pot, pot.goal.age - year.age, year.payRise))
  pot.pot += given
  pot.savedReal += given / year.prices
  deposit(wallet, extra - given)
  if (year.first) pot.savedFirstYear += given
}

/** A short year is covered by unallocated money, the emergency fund, then goal pots (latest first). */
export function coverShortfall(
  pots: GoalPot[],
  wallet: Wallet,
  shortfall: number,
  year: YearContext,
) {
  for (const pot of pots) {
    if (pot.done) continue
    pot.yearsSaving++
    if (year.first) pot.neededFirstYear = yearlyNeed(pot, pot.goal.age - year.age, year.payRise)
  }
  let short = shortfall
  let used = 0
  const take = (available: number) => {
    const taken = Math.min(short, available)
    short -= taken
    used += taken
    return taken
  }
  for (const holding of HOLDINGS) wallet.held[holding] -= take(Math.max(0, wallet.held[holding]))
  wallet.emergency -= take(wallet.emergency)
  for (const pot of [...pots].reverse()) if (!pot.done && short > 0) pot.pot -= take(pot.pot)
  return { used, short }
}

/** Where a year sits in the plan, for saving that rises with pay. */
export interface YearContext {
  age: number
  first: boolean
  prices: number
  payRise: number
}

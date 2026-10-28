// What the projection carries from year to year besides savings: the pension and the debts.
import type { HouseholdFigures } from './householdFigures'
import { monthlyRateFromApr, repayForYear } from './loans'
import type { PlanSettings } from './planSettings'

/** What the projection carries from one year to the next, besides the savings. */
export interface Balances {
  pension: number
  mortgage: number
  card: number
  loan: number
  mortgageCleared: boolean
}

export function repayDebts(f: HouseholdFigures, balances: Balances) {
  let paid = 0
  if (balances.mortgage > 1 && !balances.mortgageCleared) {
    const year = repayForYear(balances.mortgage, f.mortgageRate, f.monthlyMortgage)
    paid += year.paid
    balances.mortgage = year.balance
  }
  if (balances.card > 1) {
    const year = repayForYear(
      balances.card,
      0,
      f.monthlyCardPayment,
      monthlyRateFromApr(f.cardRate),
    )
    paid += year.paid
    balances.card = year.balance
  }
  if (balances.loan > 1) {
    const year = repayForYear(
      balances.loan,
      0,
      f.monthlyLoanPayment,
      monthlyRateFromApr(f.loanRate),
    )
    paid += year.paid
    balances.loan = year.balance
  }
  return paid
}

/** Selling the home: 90% of what is released after buying the smaller one, less the mortgage. */
export function downsize(plan: PlanSettings, balances: Balances, age: number, prices: number) {
  const f = plan.figures
  const downsizing = f.homeUse === "Yes, I'd downsize" && f.downsizeAge > 0 && f.homeValue > 0
  if (!downsizing || age !== f.downsizeAge) return 0
  const released = Math.max(0, f.homeValue - f.downsizeValue) * prices * 0.9
  const proceeds = Math.max(0, released - balances.mortgage)
  balances.mortgage = 0
  balances.mortgageCleared = true
  return proceeds
}

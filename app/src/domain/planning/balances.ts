// What the projection carries from year to year besides savings: the pension and the debts.
import type { GoalPot } from './fund'
import type { HouseholdFigures } from './householdFigures'
import { monthlyRateFromApr, repayForYear } from './loans'
import { arfMinimum, lumpSum, pensionRelief } from './pensions'
import type { PlanSettings } from './planSettings'
import { deposit, type Wallet } from './wallet'

/** What the projection carries from one year to the next, besides the savings. */
export interface Balances {
  pension: number
  mortgage: number
  card: number
  loan: number
  mortgageCleared: boolean
}

/** A year of debt repayments; the balances left go back into `balances`. */
export function repayDebts(figures: HouseholdFigures, balances: Balances) {
  let paid = 0
  if (balances.mortgage > 1 && !balances.mortgageCleared) {
    const mortgage = repayForYear(balances.mortgage, figures.mortgageRate, figures.monthlyMortgage)
    paid += mortgage.paid
    balances.mortgage = mortgage.balance
  }
  const card = repay(balances.card, figures.monthlyCardPayment, figures.cardRate)
  const loan = repay(balances.loan, figures.monthlyLoanPayment, figures.loanRate)
  balances.card = card.balance
  balances.loan = loan.balance
  return paid + card.paid + loan.paid
}

const repay = (balance: number, payment: number, apr: number) =>
  balance > 1 ? repayForYear(balance, 0, payment, monthlyRateFromApr(apr)) : { paid: 0, balance }

/** Selling the home: 90% of what is released after buying the smaller one, less the mortgage. */
export function downsize(plan: PlanSettings, balances: Balances, age: number, prices: number) {
  const { homeUse, downsizeAge, homeValue, downsizeValue } = plan.figures
  const downsizing = homeUse === "Yes, I'd downsize" && downsizeAge > 0 && homeValue > 0
  if (!downsizing || age !== downsizeAge) return 0
  const released = Math.max(0, homeValue - downsizeValue) * prices * 0.9
  const proceeds = Math.max(0, released - balances.mortgage)
  balances.mortgage = 0
  balances.mortgageCleared = true
  return proceeds
}

/** A mortgage-free goal paid this year pays down the mortgage in `balances`, clearing it if paid in full. */
export function payOffMortgage(balances: Balances, due: GoalPot[]) {
  for (const pot of due) {
    if (pot.goal.kind !== 'mfree') continue
    if (pot.paid >= pot.cost - 1) balances.mortgageCleared = true
    balances.mortgage = balances.mortgageCleared ? 0 : Math.max(0, balances.mortgage - pot.paid)
  }
}

interface IncomeYear {
  age: number
  payGrowth: number
  taxBands: number
}

/** Adds this year's contributions to the pension in `balances`; returns the tax relief and what
 * came out of take-home pay (own and auto-enrolment contributions). */
export function payIntoPension(
  plan: PlanSettings,
  balances: Balances,
  salary: number,
  year: IncomeYear,
  pensionWhatIf: number | null,
) {
  const { figures, rules } = plan
  const { age, payGrowth, taxBands } = year
  const own = (figures.monthlyOwnPension + plan.extraPension) * 12 * payGrowth
  const relief = pensionRelief(rules, salary / taxBands, own / taxBands, age) * taxBands
  let contributions = (figures.monthlyPension + plan.extraPension) * 12 * payGrowth
  if (pensionWhatIf != null) contributions = Math.max(0, contributions + pensionWhatIf * 12)
  let paid = own
  if (figures.autoEnrolled) {
    const earnings = Math.min(salary / taxBands, rules.ae.earnCap) * taxBands
    contributions += (rules.ae.ee + rules.ae.er + rules.ae.state) * earnings
    paid += rules.ae.ee * earnings
  }
  balances.pension = balances.pension * (1 + figures.pensionGrowth) + contributions
  return { relief, paid }
}

/** Retired: the pension in `balances` stays invested until it can be drawn; at the access age the
 * threshold tax is paid and the lump sum goes into `wallet`; returns the year's drawdown. */
export function drawPension(
  plan: PlanSettings,
  balances: Balances,
  wallet: Wallet,
  age: number,
  prices: number,
) {
  const { figures, rules } = plan
  const accessAge = Math.max(figures.retireAge, plan.accessAge)
  if (age < accessAge) {
    balances.pension *= 1 + figures.pensionGrowth
    return 0
  }
  if (age === accessAge) {
    const year = plan.startYear + age - (figures.age ?? 0)
    balances.pension -= rules.pen.sftRate * Math.max(0, balances.pension - plan.sftAt(year))
    if (plan.lumpShare > 0) {
      const lump = lumpSum(rules, balances.pension, plan.lumpShare)
      balances.pension -= lump.gross
      deposit(wallet, lump.net)
    }
  }
  const pot = balances.pension
  const minimum = arfMinimum(rules, age, pot)
  const drawn = Math.min(pot, wantedDrawdown(plan, pot, minimum, age, prices))
  balances.pension = (pot - drawn) * (1 + plan.growth.pensionRetired)
  return drawn
}

function wantedDrawdown(
  plan: PlanSettings,
  pot: number,
  minimum: number,
  age: number,
  prices: number,
) {
  switch (plan.drawRule) {
    case 'min':
      return pot * minimum
    case 'fixed':
      return Math.max(plan.drawFixed * prices, pot * minimum)
    default:
      return pot * Math.max(1 / Math.max(1, plan.end - age + 1), minimum)
  }
}

// Loan, saving and drawdown maths, the same formulas as the calculators workbook (C01-C28).
import type { Rules } from '../../domain/planning/rates.ts'

export const MAX_MONTHS = 1200
export const MAX_YEARS = 60

/** The monthly rate equal to a yearly rate (in %). */
export const monthlyFromYearly = (ratePercent: number) => (1 + ratePercent / 100) ** (1 / 12) - 1

/** A lump sum grown at a yearly rate (in %). */
export const grownLump = (amount: number, ratePercent: number, years: number) =>
  amount * (1 + ratePercent / 100) ** years

/** A level end-of-month saving grown at a yearly rate (in %). */
export function grownSaving(monthly: number, ratePercent: number, years: number) {
  const rate = monthlyFromYearly(ratePercent)
  const months = years * 12
  return rate ? (monthly * ((1 + rate) ** months - 1)) / rate : monthly * months
}

/** Repayment at a monthly rate over a number of months. */
export const repayment = (loan: number, monthlyRate: number, months: number) =>
  monthlyRate ? (loan * monthlyRate) / (1 - (1 + monthlyRate) ** -months) : loan / months

/** Mortgage repayment: the nominal yearly rate (in %) divided by 12. */
export const mortgageRepayment = (loan: number, ratePercent: number, years: number) =>
  repayment(loan, ratePercent / 1200, years * 12)

/** What is left after some monthly payments. */
export const balanceAfter = (loan: number, monthlyRate: number, payment: number, months: number) =>
  monthlyRate
    ? loan * (1 + monthlyRate) ** months -
      (payment * ((1 + monthlyRate) ** months - 1)) / monthlyRate
    : loan - payment * months

/** Months to repay (Excel's NPER rounded to 6 decimals, then up); Infinity if it never clears. */
export function monthsToRepay(loan: number, monthlyRate: number, payment: number) {
  if (payment <= loan * monthlyRate || payment <= 0) return Infinity
  const exact = monthlyRate
    ? -Math.log(1 - (loan * monthlyRate) / payment) / Math.log(1 + monthlyRate)
    : loan / payment
  return Math.ceil(Math.round(exact * 1e6) / 1e6)
}

/** Total interest when the last payment is only the part still owed. */
export function totalInterest(loan: number, monthlyRate: number, payment: number, months: number) {
  const lastPayment = balanceAfter(loan, monthlyRate, payment, months - 1) * (1 + monthlyRate)
  return payment * (months - 1) + lastPayment - loan
}

/** Months to clear and the interest paid, at a monthly rate. */
export function payoff(balance: number, payment: number, monthlyRate: number) {
  const months = monthsToRepay(balance, monthlyRate, payment)
  const interest = months === Infinity ? 0 : totalInterest(balance, monthlyRate, payment, months)
  return { months, interest }
}

/**
 * Years a pot lasts: the withdrawal rises with prices; taken at the start of each year (or the end).
 * A tiny tolerance: growth equal to inflation pays exactly pot ÷ withdrawal years.
 */
export function yearsLasting(
  pot: number,
  withdrawal: number,
  growthPercent: number,
  inflationPercent: number,
  atYearEnd: boolean,
) {
  const growth = 1 + growthPercent / 100
  let years = 0
  while (years < MAX_YEARS) {
    if (atYearEnd) {
      if (pot * growth + 1e-6 < withdrawal) break
      pot = pot * growth - withdrawal
    } else {
      if (pot + 1e-6 < withdrawal) break
      pot = (pot - withdrawal) * growth
    }
    withdrawal *= 1 + inflationPercent / 100
    years++
  }
  return years
}

/** Stamp duty, band by band. */
export function stampDuty(rules: Rules, price: number) {
  let duty = 0
  let from = 0
  for (const [upTo, rate] of rules.home.stamp) {
    duty += Math.max(0, Math.min(price, upTo) - from) * rate
    from = upTo
    if (price <= upTo) break
  }
  return duty
}

/** The share of pay that can get pension tax relief at this age. */
export function reliefLimit(rules: Rules, age: number) {
  const bands = rules.pen.relief
  return (bands.find(([upTo]) => age < upTo) ?? bands.at(-1)!)[1]
}

/** Pension contributions that rise with pay, paid at the end of each year, grown to retirement. */
export function grownContributions(
  monthly: number,
  growth: number,
  payRise: number,
  years: number,
) {
  if (Math.abs(growth - payRise) < 1e-12) return 12 * monthly * years * (1 + growth) ** (years - 1)
  return (12 * monthly * ((1 + growth) ** years - (1 + payRise) ** years)) / (growth - payRise)
}

export const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value))

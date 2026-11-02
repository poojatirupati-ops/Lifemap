// Home & Mortgage: borrowing, repayments, deposit, overpaying, rate and term changes, rent vs buy.
import type { CalcContext, CalcInput } from './types.ts'

export const HOME_GOAL_YEARS = 3
export const STAMP_NOTE =
  'Stamp duty is worked out on the price shown; for a new home it is charged on the price excluding VAT, and Help to Buy is not included.'
export const homeGoal = (amount: number, saved?: number) => ({
  kind: 'spend',
  goalKind: 'home',
  name: 'Buy a home (deposit goal)',
  emoji: '🏡',
  amount,
  ...(saved != null && { saved }),
  years: HOME_GOAL_YEARS,
})
export const fees = (context: CalcContext) => Number(context.assumption('buyFees'))
export const rate = (label: string, example: number): CalcInput => ({
  key: 'rate',
  label,
  example,
  min: 1,
  max: 8,
  step: 0.05,
  unit: '%',
})

/** The customer's stated repayment, while the tool still shows their own mortgage figures. */
export const statedPayment = (context: CalcContext, keys: string[]) =>
  context.untouched(keys) ? context.statedMortgagePayment : null

/** Price where the cash pays the deposit share and stamp duty, band by band (solved exactly). */
export function priceFor(cash: number, share: number, bands: [number, number][]) {
  let from = 0
  let paid = 0
  for (const [upTo, stamp] of bands) {
    const bandCost = (share + stamp) * (Math.min(upTo, 1e15) - from)
    if (cash <= paid + bandCost || upTo >= 1e15) return from + (cash - paid) / (share + stamp)
    paid += bandCost
    from = upTo
  }
  return from
}

/** A yearly amount rising each year, added up over the years. */
export const risingTotal = (yearly: number, rise: number, count: number) =>
  rise === 0 ? yearly * count : (yearly * ((1 + rise) ** count - 1)) / rise

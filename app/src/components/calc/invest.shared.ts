// Investments: lump sum, real return, regular investing, fees, risk and return.
import { type CalcContext } from './types.ts'
import { NO_INFLATION, NO_INFLATION_GOAL, years } from './words.ts'

export const WAIT_YEARS = 5
export const ONE_IN_20 = 1.645 // the standard-normal value for a 1-in-20 year
export const STYLES = ['Cautious', 'Balanced', 'Growth']

/** Growth after a yearly fee taken off the grown value. */
export const afterFees = (growthPercent: number, feePercent: number) =>
  (1 + growthPercent / 100) * (1 - feePercent / 100) - 1

export const growGoal = (today: number | null, term: number) =>
  today == null
    ? { kind: 'blocked', msg: NO_INFLATION_GOAL }
    : { kind: 'pot', name: 'Grow my wealth', em: '📈', amount: Math.round(today), years: term }

/** The headline in today's money when the switch is on, and the real return. */
export function todaysMoney(future: number, term: number, growth: number, context: CalcContext) {
  const { inflation, adjustForInflation } = context
  const today = inflation == null ? null : future / (1 + inflation) ** term
  const realReturn = inflation == null ? NO_INFLATION : (1 + growth) / (1 + inflation) - 1
  return { today, realReturn, adjusted: adjustForInflation }
}

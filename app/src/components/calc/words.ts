// Wording the calculators share: durations, signed amounts and the inflation sentences.
import { euro, percent } from '../../lib/format.ts'
import type { Rules } from '../../domain/planning/rates.ts'
import { MAX_MONTHS } from './maths.ts'
import type { CalcContext } from './types.ts'

export const NO_INFLATION = 'Choose your inflation rate to see this'
export const NO_INFLATION_GOAL = 'Choose an inflation rate first'

/** "1 year", "3 years" */
export const years = (count: number) => count + (count === 1 ? ' year' : ' years')

/** "2 yrs 3 mo", "1 yr", "5 months" */
export function yearsAndMonths(months: number) {
  const whole = Math.floor(months / 12)
  const rest = Math.round(months % 12)
  if (!whole) return rest + (rest === 1 ? ' month' : ' months')
  return whole + ' yr' + (whole > 1 ? 's' : '') + (rest ? ' ' + rest + ' mo' : '')
}

/** A repayment time, or why there is none. */
export function repaidIn(months: number, never = 'Never at this repayment') {
  if (months === Infinity) return never
  if (months > MAX_MONTHS) return 'Over 100 years'
  return yearsAndMonths(months)
}

/** "2.5 months", "1 month" */
export function monthsText(months: number) {
  const rounded = Math.round(months * 10) / 10
  return (
    (rounded % 1 ? rounded.toFixed(1) : String(rounded)) + (rounded === 1 ? ' month' : ' months')
  )
}

/** "+€120", "−€80" */
export const signed = (amount: number) => (amount < 0 ? '−' : '+') + euro(Math.abs(amount))

export const beforeTax = ({ sav }: Rules) =>
  `Before tax: deposit interest pays DIRT at ${Math.round(sav.dirt * 100)}%; investment funds and life policies pay exit tax at ${Math.round(sav.exit * 100)}% (plus ${sav.deemed}-year deemed disposal). No tax is taken off here.`

/** "2.5% a year" */
export const inflationText = (inflation: number) => percent(inflation) + ' a year'

/** " Prices rising 2% a year, your choice." once inflation is chosen. */
export const inflationLine = ({ inflation }: CalcContext) =>
  inflation == null ? '' : ` Prices rising ${inflationText(inflation)}, your choice.`

/** A future amount in today's money. */
export const inTodaysMoney = (future: number, yearsAhead: number, inflation: number) =>
  future / (1 + inflation) ** yearsAhead

export const worthToday = (future: number, yearsAhead: number, { inflation }: CalcContext) =>
  inflation == null
    ? "Choose your inflation rate to see what it's worth in today's money. "
    : `Worth about ${euro(inTodaysMoney(future, yearsAhead, inflation))} in today's money. `

/** "Real return about 2.4% a year (5% growth, prices rising 2.5%). " */
export function realReturnLine(growthPercent: number, what: string, inflation: number) {
  const real = (1 + growthPercent / 100) / (1 + inflation) - 1
  return `Real return about ${(real * 100).toFixed(1)}% a year (${+(+growthPercent).toFixed(2)}% ${what}, prices rising ${percent(inflation)}). `
}

/** Asked for today's money before choosing inflation. */
export const adjustNeedsInflation = ({ adjustForInflation, inflation }: CalcContext) =>
  adjustForInflation && inflation == null
    ? "Choose your inflation rate to see it in today's money. "
    : ''

export const EXAMPLE_LABEL = 'Example figures. Change them to yours.'

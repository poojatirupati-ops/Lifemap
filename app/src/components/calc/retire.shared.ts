// Pensions & Retirement: projection, contributions, AVCs, how long money lasts, drawdown scenarios.
import { euro } from '../../lib/format.ts'
import { MAX_YEARS, reliefLimit } from './maths.ts'
import { input, type CalcContext, type Figures } from './types.ts'
import { NO_INFLATION, years } from './words.ts'

export const growthInput = input('g', 'Growth assumption', 4.5, 1, 7, 0.25, '%')
export const taxInput = input('tr', 'Your tax rate', 40, 20, 40, 20, 'tax')
export const ageInput = input('age', 'Your age (for the relief limit)', 40, 18, 75, 1, 'age')
export const paidInput = input('ex', 'What you pay in yourself now, a year', 0, 0, 100000, 100, '€')
export const NO_RETIRE_AGE = 'Choose a retirement age after your age to see this'

export const todayOf = (future: number, term: number, { inflation }: CalcContext) =>
  inflation == null ? null : future / (1 + inflation) ** term

/** Tax relief on contributions, within the age band and earnings cap, after what is paid in already. */
export function relief(v: Figures, yearly: number, context: CalcContext) {
  const { pen } = context.rules
  const share = reliefLimit(context.rules, v.age)
  const limit = share * Math.min(v.sal, pen.earnCap)
  const room = Math.max(0, limit - v.ex)
  const relievedYearly = Math.min(yearly, room)
  const sentence = `Tax relief has an age limit: at ${v.age} it applies to up to ${Math.round(share * 100)}% of your earnings (earnings counted up to ${euro(pen.earnCap)}), which is ${euro(limit)} a year`
  return { limit, room, relievedYearly, monthly: (relievedYearly * v.tr) / 100 / 12, sentence }
}

export function blockedRetirement(age: number) {
  const names = [
    'Gap_Today',
    'Projected_Fund',
    'Fund_Today',
    'Calculated_Fund',
    'Target_Today',
    'Years_To_Retirement',
    'Bridge_Years',
    'Lump_Sum',
    'Lump_Sum_Tax',
    'Lump_Sum_Net',
  ]
  return {
    label: "Illustrative gap (today's money)",
    value: NO_RETIRE_AGE,
    line: `Your retirement age has to be after your age today (${age}), so the tool can count the years you still have to save.`,
    rows: [],
    goal: { kind: 'blocked', msg: 'Choose a retirement age after your age first' },
    numbers: {
      ...Object.fromEntries(names.map((name) => [name, NO_RETIRE_AGE])),
      Early_Warning: '',
      SFT_Warning: '',
      Use_Statement_Projection: NO_RETIRE_AGE,
      Plan_Goal_Income: NO_RETIRE_AGE,
      Plan_Goal_Age: NO_RETIRE_AGE,
    },
  }
}

export const atYearEnd = (context: CalcContext) => context.assumption('ddTiming') === 'end'
export const yearsText = (count: number) => (count < 1 ? 'Less than a year' : years(count))
export const lastingText = (count: number | null) =>
  count == null ? NO_INFLATION : count >= MAX_YEARS ? '60+ years' : yearsText(count)
export const withdrawals = [
  input('pot', 'Retirement savings', 400000, 10000, 3000000, 10000, '€'),
  input('w', 'Yearly withdrawal (first year)', 24000, 1000, 200000, 1000, '€'),
]

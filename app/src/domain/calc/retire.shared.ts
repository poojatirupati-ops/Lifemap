// Pensions & Retirement: projection, contributions, AVCs, how long money lasts, drawdown scenarios.
import { euro } from '../../lib/format.ts'
import { MAX_YEARS, reliefLimit } from './maths.ts'
import type { CalcContext, CalcInput, Figures } from './types.ts'
import { NO_INFLATION, years } from './words.ts'

export const growthInput: CalcInput = {
  key: 'g',
  label: 'Growth assumption',
  example: 4.5,
  min: 1,
  max: 7,
  step: 0.25,
  unit: '%',
}
export const taxInput: CalcInput = {
  key: 'tr',
  label: 'Your tax rate',
  example: 40,
  min: 20,
  max: 40,
  step: 20,
  unit: 'tax',
}
export const ageInput: CalcInput = {
  key: 'age',
  label: 'Your age (for the relief limit)',
  example: 40,
  min: 18,
  max: 75,
  step: 1,
  unit: 'age',
}
export const paidInput: CalcInput = {
  key: 'ex',
  label: 'What you pay in yourself now, a year',
  example: 0,
  min: 0,
  max: 100000,
  step: 100,
  unit: '€',
}
export const NO_RETIRE_AGE = 'Choose a retirement age after your age to see this'

export const todayOf = (future: number, term: number, { inflation }: CalcContext) =>
  inflation == null ? null : future / (1 + inflation) ** term

/** Tax relief on contributions, within the age band and earnings cap, after what is paid in already. */
export function relief(figures: Figures, yearly: number, context: CalcContext) {
  const { pen } = context.rules
  const share = reliefLimit(context.rules, figures.age)
  const limit = share * Math.min(figures.sal, pen.earnCap)
  const room = Math.max(0, limit - figures.ex)
  const relievedYearly = Math.min(yearly, room)
  const sentence = `Tax relief has an age limit: at ${figures.age} it applies to up to ${Math.round(share * 100)}% of your earnings (earnings counted up to ${euro(pen.earnCap)}), which is ${euro(limit)} a year`
  return {
    limit,
    room,
    relievedYearly,
    monthly: (relievedYearly * figures.tr) / 100 / 12,
    sentence,
  }
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
    goal: { kind: 'blocked', message: 'Choose a retirement age after your age first' },
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
export const withdrawals: CalcInput[] = [
  {
    key: 'pot',
    label: 'Retirement savings',
    example: 400000,
    min: 10000,
    max: 3000000,
    step: 10000,
    unit: '€',
  },
  {
    key: 'w',
    label: 'Yearly withdrawal (first year)',
    example: 24000,
    min: 1000,
    max: 200000,
    step: 1000,
    unit: '€',
  },
]

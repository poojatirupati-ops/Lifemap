import { euro } from '../../lib/format.ts'
import { monthlyFromYearly } from './maths.ts'
import type { Calculator } from './types.ts'
import { beforeTax, inflationLine, NO_INFLATION, years } from './words.ts'

export const goalPlanner: Calculator = {
  id: 'goalplanner',
  inputs: [
    {
      key: 't',
      label: "Goal amount (today's prices)",
      example: 15000,
      min: 500,
      max: 500000,
      step: 500,
      unit: '€',
    },
    { key: 'y', label: 'Years until the goal', example: 3, min: 1, max: 30, step: 1, unit: 'y' },
    { key: 's', label: 'Already saved', example: 2000, min: 0, max: 200000, step: 500, unit: '€' },
    {
      key: 'r',
      label: 'Growth / interest a year',
      example: 2,
      min: 0,
      max: 7,
      step: 0.5,
      unit: '%',
    },
  ],
  run({ t: target, y: term, s: saved, r: rate }, context) {
    const { inflation } = context
    const known = inflation != null
    const future = known ? target * (1 + inflation) ** term : null
    const grown = saved * (1 + rate / 100) ** term
    const still = known ? Math.max(0, future! - grown) : null
    const monthlyRate = monthlyFromYearly(rate)
    const count = term * 12
    const monthly = !known
      ? null
      : still! <= 0
        ? 0
        : monthlyRate
          ? (still! * monthlyRate) / ((1 + monthlyRate) ** count - 1)
          : still! / count
    const show = (amount: number | null) => (known ? euro(amount!) : NO_INFLATION)
    const line = known
      ? `Your goal will cost about ${euro(future!)} in ${years(term)}. Setting aside about ${euro(monthly!)} a month could reach it.${inflationLine(context)}`
      : 'Choose your inflation rate to see what your goal will cost by then and the monthly amount.'
    return {
      label: 'Monthly amount to save',
      value: show(monthly),
      line: `${line} ${beforeTax(context.rules)}`,
      rows: [
        ["Goal in today's prices", euro(target)],
        [`Will cost about (in ${years(term)})`, show(future)],
        ['Your savings grow to', euro(grown)],
        ['Still needed at the goal year', show(still)],
      ],
      goal: { kind: 'spend', name: 'My goal', emoji: '🎯', amount: target, saved, years: term },
      numbers: {
        Monthly_Saving: monthly ?? NO_INFLATION,
        Future_Cost: future ?? NO_INFLATION,
        Saved_Grows_To: grown,
        Still_Needed: still ?? NO_INFLATION,
        Plan_Goal_Amount: target,
        Plan_Goal_Saved: saved,
        Plan_Goal_Years: term,
      },
    }
  },
}

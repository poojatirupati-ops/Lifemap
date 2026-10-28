import { euro } from '../../lib/format.ts'
import { monthlyFromYearly } from './maths.ts'
import { input, type Calculator } from './types.ts'
import { beforeTax, inflationLine, NO_INFLATION, years } from './words.ts'

export const goalPlanner: Calculator = {
  id: 'goalplanner',
  inputs: [
    input('t', "Goal amount (today's prices)", 15000, 500, 500000, 500, '€'),
    input('y', 'Years until the goal', 3, 1, 30, 1, 'y'),
    input('s', 'Already saved', 2000, 0, 200000, 500, '€'),
    input('r', 'Growth / interest a year', 2, 0, 7, 0.5, '%'),
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
      goal: { kind: 'spend', name: 'My goal', em: '🎯', amount: target, saved, years: term },
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

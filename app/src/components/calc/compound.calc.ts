import { euro } from '../../lib/format.ts'
import { monthlyFromYearly } from './maths.ts'
import { input, type Calculator } from './types.ts'
import {
  beforeTax,
  inflationLine,
  inTodaysMoney,
  NO_INFLATION,
  NO_INFLATION_GOAL,
  worthToday,
  years,
} from './words.ts'

export const compound: Calculator = {
  id: 'compound',
  inputs: [
    input('p', 'Starting amount', 5000, 0, 200000, 500, '€'),
    input('m', 'Monthly addition', 200, 0, 3000, 25, '€'),
    input('r', 'Growth rate a year', 4, 0, 8, 0.5, '%'),
    input('y', 'Years', 20, 1, 40, 1, 'y'),
  ],
  run({ p: start, m: monthly, r: rate, y: term }, context) {
    const monthlyRate = monthlyFromYearly(rate)
    const count = term * 12
    const grown =
      start * (1 + monthlyRate) ** count +
      (monthlyRate ? (monthly * ((1 + monthlyRate) ** count - 1)) / monthlyRate : monthly * count)
    const paidIn = start + monthly * 12 * term
    const { inflation } = context
    const today = inflation == null ? null : inTodaysMoney(grown, term, inflation)
    return {
      label: 'Could grow to',
      value: euro(grown),
      line: `You would put in ${euro(paidIn)}. Growth could add about ${euro(grown - paidIn)} (illustrative, not guaranteed). ${worthToday(grown, term, context)}${inflationLine(context)} ${beforeTax(context.rules)}`,
      rows: [
        ['Paid in', euro(paidIn)],
        ['Illustrative growth', euro(grown - paidIn)],
        ["Worth in today's money", today == null ? NO_INFLATION : euro(today)],
      ],
      goal:
        today == null
          ? { kind: 'blocked', msg: NO_INFLATION_GOAL }
          : {
              kind: 'pot',
              name: 'Grow my wealth',
              em: '📈',
              amount: Math.round(today),
              years: term,
            },
      numbers: {
        Grows_To: grown,
        Value_Today: today ?? NO_INFLATION,
        Paid_In: paidIn,
        Growth_Earned: grown - paidIn,
        Plan_Goal_Amount: today == null ? NO_INFLATION_GOAL : Math.round(today),
      },
    }
  },
}

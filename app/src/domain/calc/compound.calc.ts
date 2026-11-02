import { euro } from '../../lib/format.ts'
import { monthlyFromYearly } from './maths.ts'
import type { Calculator } from './types.ts'
import {
  beforeTax,
  inflationLine,
  inTodaysMoney,
  NO_INFLATION,
  NO_INFLATION_GOAL,
  worthToday,
} from './words.ts'

export const compound: Calculator = {
  id: 'compound',
  inputs: [
    {
      key: 'p',
      label: 'Starting amount',
      example: 5000,
      min: 0,
      max: 200000,
      step: 500,
      unit: '€',
    },
    { key: 'm', label: 'Monthly addition', example: 200, min: 0, max: 3000, step: 25, unit: '€' },
    { key: 'r', label: 'Growth rate a year', example: 4, min: 0, max: 8, step: 0.5, unit: '%' },
    { key: 'y', label: 'Years', example: 20, min: 1, max: 40, step: 1, unit: 'y' },
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
          ? { kind: 'blocked', message: NO_INFLATION_GOAL }
          : {
              kind: 'pot',
              name: 'Grow my wealth',
              emoji: '📈',
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

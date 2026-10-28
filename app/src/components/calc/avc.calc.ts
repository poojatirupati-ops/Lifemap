import { euro } from '../../lib/format.ts'
import { grownSaving } from './maths.ts'
import { input, type Calculator } from './types.ts'
import { inflationLine, NO_INFLATION } from './words.ts'
import { growthInput, taxInput, ageInput, paidInput, todayOf, relief } from './retire.shared.ts'

export const avc: Calculator = {
  id: 'avc',
  inputs: [
    input('m', 'AVC per month', 200, 25, 2000, 25, '€'),
    input('sal', 'Salary (for the relief limit)', 60000, 15000, 250000, 1000, '€'),
    input('y', 'Years to retirement', 15, 1, 40, 1, 'y'),
    growthInput,
    taxInput,
    ageInput,
    paidInput,
  ],
  run(v, context) {
    const grown = grownSaving(v.m, v.g, v.y)
    const r = relief(v, v.m * 12, context)
    const netMonthly = v.m - r.monthly
    const today = todayOf(grown, v.y, context)
    return {
      label: 'Could add',
      value: euro(grown),
      line: `Each ${euro(v.m)} AVC could cost about ${euro(netMonthly)} after tax relief. ${r.sentence} for your main scheme and AVCs together. You already pay in ${euro(v.ex)} a year, so up to ${euro(r.room)} a year more gets relief.${inflationLine(context)}`,
      rows: [
        ['Paid in', euro(v.m * 12 * v.y)],
        ['Net cost to you', euro(netMonthly * 12 * v.y)],
        ['Tax relief a month', euro(r.monthly)],
        ["Worth in today's money", today == null ? NO_INFLATION : euro(today)],
      ],
      goal: { kind: 'pension', name: 'Raise my pension contribution (AVC)', em: '🌅', amount: v.m },
      numbers: {
        Grows_To: grown,
        Value_Today: today ?? NO_INFLATION,
        Paid_In: v.m * 12 * v.y,
        Net_Cost: netMonthly * 12 * v.y,
        Net_Cost_Per_Month: netMonthly,
        Relief_Limit_Year: r.limit,
        Relieved_Year: r.relievedYearly,
        Relief_Per_Month: r.monthly,
        Plan_Goal_Contribution: v.m,
      },
    }
  },
}

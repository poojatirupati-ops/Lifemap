import { euro } from '../../lib/format.ts'
import { grownSaving } from './maths.ts'
import type { Calculator } from './types.ts'
import { inflationLine, NO_INFLATION } from './words.ts'
import { growthInput, taxInput, ageInput, paidInput, todayOf, relief } from './retire.shared.ts'

export const avc: Calculator = {
  id: 'avc',
  inputs: [
    { key: 'm', label: 'AVC per month', example: 200, min: 25, max: 2000, step: 25, unit: '€' },
    {
      key: 'sal',
      label: 'Salary (for the relief limit)',
      example: 60000,
      min: 15000,
      max: 250000,
      step: 1000,
      unit: '€',
    },
    { key: 'y', label: 'Years to retirement', example: 15, min: 1, max: 40, step: 1, unit: 'y' },
    growthInput,
    taxInput,
    ageInput,
    paidInput,
  ],
  run(figures, context) {
    const { m: monthly, g: growthPercent, y: term, ex: paidAlready } = figures
    const grown = grownSaving(monthly, growthPercent, term)
    const r = relief(figures, monthly * 12, context)
    const netMonthly = monthly - r.monthly
    const today = todayOf(grown, term, context)
    return {
      label: 'Could add',
      value: euro(grown),
      line: `Each ${euro(monthly)} AVC could cost about ${euro(netMonthly)} after tax relief. ${r.sentence} for your main scheme and AVCs together. You already pay in ${euro(paidAlready)} a year, so up to ${euro(r.room)} a year more gets relief.${inflationLine(context)}`,
      rows: [
        ['Paid in', euro(monthly * 12 * term)],
        ['Net cost to you', euro(netMonthly * 12 * term)],
        ['Tax relief a month', euro(r.monthly)],
        ["Worth in today's money", today == null ? NO_INFLATION : euro(today)],
      ],
      goal: {
        kind: 'pension',
        name: 'Raise my pension contribution (AVC)',
        emoji: '🌅',
        amount: monthly,
      },
      numbers: {
        Grows_To: grown,
        Value_Today: today ?? NO_INFLATION,
        Paid_In: monthly * 12 * term,
        Net_Cost: netMonthly * 12 * term,
        Net_Cost_Per_Month: netMonthly,
        Relief_Limit_Year: r.limit,
        Relieved_Year: r.relievedYearly,
        Relief_Per_Month: r.monthly,
        Plan_Goal_Contribution: monthly,
      },
    }
  },
}

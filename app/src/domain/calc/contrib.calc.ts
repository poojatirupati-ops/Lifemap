import { euro, percent } from '../../lib/format.ts'
import { grownContributions } from './maths.ts'
import type { Calculator } from './types.ts'
import { inflationLine, NO_INFLATION } from './words.ts'
import { growthInput, taxInput, ageInput, paidInput, todayOf, relief } from './retire.shared.ts'

export const contribution: Calculator = {
  id: 'contrib',
  inputs: [
    { key: 'sal', label: 'Salary', example: 60000, min: 15000, max: 250000, step: 1000, unit: '€' },
    {
      key: 'inc',
      label: 'Increase contributions by (% of salary)',
      example: 2,
      min: 0.5,
      max: 10,
      step: 0.5,
      unit: '%',
    },
    { key: 'y', label: 'Years to retirement', example: 25, min: 1, max: 45, step: 1, unit: 'y' },
    { ...growthInput, label: 'Growth assumption' },
    taxInput,
    ageInput,
    paidInput,
  ],
  run(figures, context) {
    const {
      sal: salary,
      inc: increasePercent,
      g: growthPercent,
      y: term,
      tr: reliefRate,
      ex: paidAlready,
    } = figures
    const monthly = (salary * increasePercent) / 100 / 12
    const grown = grownContributions(monthly, growthPercent / 100, context.wage, term)
    const r = relief(figures, monthly * 12, context)
    const net = monthly - r.monthly
    const today = todayOf(grown, term, context)
    return {
      label: 'Could add to your pension',
      value: euro(grown),
      line: `An extra ${euro(monthly)} a month could cost about ${euro(net)} after tax relief at ${reliefRate}% (USC and PRSI still apply). ${r.sentence}. You already pay in ${euro(paidAlready)} a year, so up to ${euro(r.room)} a year more gets relief. The extra rises with pay each year (${percent(context.wage)}), as in your plan.${inflationLine(context)}`,
      rows: [
        ['Extra per month (first year)', euro(monthly)],
        ['Cost to you after tax relief, a month', euro(net)],
        ['Tax relief a month', euro(r.monthly)],
        ["Worth in today's money", today == null ? NO_INFLATION : euro(today)],
      ],
      goal: {
        kind: 'pension',
        name: 'Raise my pension contribution',
        emoji: '🌅',
        amount: monthly,
      },
      numbers: {
        Grows_To: grown,
        Value_Today: today ?? NO_INFLATION,
        Extra_Per_Month: monthly,
        Net_Cost_Per_Month: net,
        Relief_Limit_Year: r.limit,
        Relieved_Year: r.relievedYearly,
        Relief_Per_Month: r.monthly,
        Plan_Goal_Contribution: monthly,
      },
    }
  },
}

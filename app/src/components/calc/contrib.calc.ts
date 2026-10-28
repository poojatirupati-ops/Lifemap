import { euro, percent } from '../../lib/format.ts'
import { grownContributions } from './maths.ts'
import { input, type Calculator } from './types.ts'
import { inflationLine, NO_INFLATION } from './words.ts'
import { growthInput, taxInput, ageInput, paidInput, todayOf, relief } from './retire.shared.ts'

export const contribution: Calculator = {
  id: 'contrib',
  inputs: [
    input('sal', 'Salary', 60000, 15000, 250000, 1000, '€'),
    input('inc', 'Increase contributions by (% of salary)', 2, 0.5, 10, 0.5, '%'),
    input('y', 'Years to retirement', 25, 1, 45, 1, 'y'),
    { ...growthInput, label: 'Growth assumption' },
    taxInput,
    ageInput,
    paidInput,
  ],
  run(v, context) {
    const monthly = (v.sal * v.inc) / 100 / 12
    const grown = grownContributions(monthly, v.g / 100, context.wage, v.y)
    const r = relief(v, monthly * 12, context)
    const net = monthly - r.monthly
    const today = todayOf(grown, v.y, context)
    return {
      label: 'Could add to your pension',
      value: euro(grown),
      line: `An extra ${euro(monthly)} a month could cost about ${euro(net)} after tax relief at ${v.tr}% (USC and PRSI still apply). ${r.sentence}. You already pay in ${euro(v.ex)} a year, so up to ${euro(r.room)} a year more gets relief. The extra rises with pay each year (${percent(context.wage)}), as in your plan.${inflationLine(context)}`,
      rows: [
        ['Extra per month (first year)', euro(monthly)],
        ['Cost to you after tax relief, a month', euro(net)],
        ['Tax relief a month', euro(r.monthly)],
        ["Worth in today's money", today == null ? NO_INFLATION : euro(today)],
      ],
      goal: { kind: 'pension', name: 'Raise my pension contribution', em: '🌅', amount: monthly },
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

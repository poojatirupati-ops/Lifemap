import { euro } from '../../lib/format.ts'
import { grownSaving } from './maths.ts'
import { input, type Calculator } from './types.ts'
import {
  adjustNeedsInflation,
  beforeTax,
  NO_INFLATION,
  NO_INFLATION_GOAL,
  realReturnLine,
  years,
} from './words.ts'
import { afterFees, growGoal, todaysMoney } from './invest.shared.ts'

export const regularInvest: Calculator = {
  id: 'regularinvest',
  inputs: [
    input('m', 'Monthly amount', 300, 25, 5000, 25, '€'),
    input('y', 'Years', 15, 1, 40, 1, 'y'),
    input('g', 'Growth a year (before fees)', 5, 0, 8, 0.5, '%'),
    input('f', 'Yearly fees', 1, 0, 3, 0.05, '%'),
  ],
  run({ m: monthly, y: term, g: rate, f: fee }, context) {
    const growth = afterFees(rate, fee)
    const gross = grownSaving(monthly, rate, term)
    const net = grownSaving(monthly, growth * 100, term)
    const { today, realReturn, adjusted } = todaysMoney(net, term, growth, context)
    const known = today != null
    const headline = adjusted ? (known ? today : NO_INFLATION) : net
    const opening =
      adjusted && known
        ? realReturnLine(growth * 100, 'growth after fees', context.inflation!)
        : adjustNeedsInflation(context)
    return {
      label: adjusted ? "In today's money (after fees)" : 'Could grow to (after fees)',
      value: typeof headline === 'number' ? euro(headline) : headline,
      line: `${opening}Fees of ${fee}% a year could cost about ${euro(gross - net)} over ${years(term)}. ${beforeTax(context.rules)}`,
      rows: [
        ['Paid in', euro(monthly * 12 * term)],
        ['Before fees', euro(gross)],
        ['Fees cost', euro(gross - net)],
        ...(adjusted
          ? [["Worth in today's money", known ? euro(today) : NO_INFLATION] as [string, string]]
          : []),
      ],
      goal: growGoal(today, term),
      numbers: {
        Headline: headline,
        Value_After_Fees: net,
        Value_Before_Fees: gross,
        Fees_Cost: gross - net,
        Paid_In: monthly * 12 * term,
        Value_Today: today ?? NO_INFLATION,
        Growth_After_Fees: growth,
        Real_Return: realReturn,
        Plan_Goal_Amount: known ? Math.round(today) : NO_INFLATION_GOAL,
      },
    }
  },
}

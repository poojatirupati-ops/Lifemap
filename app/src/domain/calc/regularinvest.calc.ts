import { euro } from '../../lib/format.ts'
import { grownSaving } from './maths.ts'
import type { Calculator } from './types.ts'
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
    { key: 'm', label: 'Monthly amount', example: 300, min: 25, max: 5000, step: 25, unit: '€' },
    { key: 'y', label: 'Years', example: 15, min: 1, max: 40, step: 1, unit: 'y' },
    {
      key: 'g',
      label: 'Growth a year (before fees)',
      example: 5,
      min: 0,
      max: 8,
      step: 0.5,
      unit: '%',
    },
    { key: 'f', label: 'Yearly fees', example: 1, min: 0, max: 3, step: 0.05, unit: '%' },
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

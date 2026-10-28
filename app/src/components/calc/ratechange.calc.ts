import { euro } from '../../lib/format.ts'
import { mortgageRepayment, repayment } from './maths.ts'
import { input, type Calculator } from './types.ts'
import { signed } from './words.ts'
import { rate, statedPayment } from './home.shared.ts'

export const rateChange: Calculator = {
  id: 'ratechange',
  inputs: [
    input('loan', 'Mortgage balance', 300000, 50000, 1000000, 1000, '€'),
    rate('Current rate', 4),
    input('term', 'Years left', 25, 5, 35, 1, 'y'),
    input('d', 'Rate change', 1, -2, 3, 0.25, '%'),
  ],
  run(v, context) {
    const formula = mortgageRepayment(v.loan, v.rate, v.term)
    const stated = statedPayment(context, ['loan', 'rate', 'term'])
    const now = stated?.amount || formula
    const newRate = Math.max(0, v.rate + v.d)
    const after = now + repayment(v.loan, newRate / 1200, v.term * 12) - formula
    const from = stated ? ` (from ${stated.from})` : ''
    return {
      label: 'Monthly change',
      value: signed(after - now),
      line: `What-if: if your rate changed to ${newRate.toFixed(2)}%, your repayment would be about ${euro(after)} a month instead of ${euro(now)}${from}.`,
      rows: [
        ['Now', euro(now)],
        ['After change', euro(after)],
        ['Change over a year', signed((after - now) * 12)],
      ],
      goal: null,
      numbers: {
        Monthly_Change: after - now,
        Repayment_Now: now,
        Repayment_After: after,
        Yearly_Change: (after - now) * 12,
        New_Rate: newRate / 100,
        Formula_Now: formula,
      },
    }
  },
}

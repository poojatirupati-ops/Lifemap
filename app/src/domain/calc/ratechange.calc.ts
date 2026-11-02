import { euro } from '../../lib/format.ts'
import { mortgageRepayment, repayment } from './maths.ts'
import type { Calculator } from './types.ts'
import { signed } from './words.ts'
import { rate, statedPayment } from './home.shared.ts'

export const rateChange: Calculator = {
  id: 'ratechange',
  inputs: [
    {
      key: 'loan',
      label: 'Mortgage balance',
      example: 300000,
      min: 50000,
      max: 1000000,
      step: 1000,
      unit: '€',
    },
    rate('Current rate', 4),
    { key: 'term', label: 'Years left', example: 25, min: 5, max: 35, step: 1, unit: 'y' },
    { key: 'd', label: 'Rate change', example: 1, min: -2, max: 3, step: 0.25, unit: '%' },
  ],
  run(figures, context) {
    const { loan, rate: ratePercent, term, d: rateChange } = figures
    const formula = mortgageRepayment(loan, ratePercent, term)
    const stated = statedPayment(context, ['loan', 'rate', 'term'])
    const now = stated?.amount || formula
    const newRate = Math.max(0, ratePercent + rateChange)
    const after = now + repayment(loan, newRate / 1200, term * 12) - formula
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

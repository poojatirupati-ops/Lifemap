import { euro } from '../../lib/format.ts'
import { monthlyFromYearly, repayment } from './maths.ts'
import type { Calculator } from './types.ts'
import { years } from './words.ts'

export const loan: Calculator = {
  id: 'loan',
  inputs: [
    { key: 'a', label: 'Loan amount', example: 15000, min: 500, max: 100000, step: 500, unit: '€' },
    { key: 'apr', label: 'Interest (APR)', example: 8, min: 0, max: 25, step: 0.25, unit: '%' },
    { key: 'y', label: 'Years', example: 5, min: 1, max: 10, step: 1, unit: 'y' },
  ],
  run({ a: amount, apr, y: term }) {
    const monthlyRate = monthlyFromYearly(apr)
    const monthly = repayment(amount, monthlyRate, term * 12)
    const total = monthly * term * 12
    return {
      label: 'Monthly repayment',
      value: euro(monthly),
      line: `Total interest of about ${euro(total - amount)} over ${years(term)}. The APR is treated as an effective yearly rate (as for cards and loans; mortgage tools use the nominal rate ÷ 12, so the same percentage gives a slightly different repayment).`,
      rows: [
        ['Total repaid', euro(total)],
        ['Total interest', euro(total - amount)],
      ],
      goal: null,
      numbers: {
        Monthly_Repayment: monthly,
        Total_Repaid: total,
        Total_Interest: total - amount,
        Monthly_Rate: monthlyRate,
      },
    }
  },
}

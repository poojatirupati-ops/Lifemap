import { euro } from '../../lib/format.ts'
import { monthlyFromYearly, repayment } from './maths.ts'
import { input, type Calculator } from './types.ts'
import { years } from './words.ts'

export const loan: Calculator = {
  id: 'loan',
  inputs: [
    input('a', 'Loan amount', 15000, 500, 100000, 500, '€'),
    input('apr', 'Interest (APR)', 8, 0, 25, 0.25, '%'),
    input('y', 'Years', 5, 1, 10, 1, 'y'),
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

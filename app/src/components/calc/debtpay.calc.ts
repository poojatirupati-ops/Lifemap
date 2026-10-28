import { euro } from '../../lib/format.ts'
import { MAX_MONTHS, monthlyFromYearly, monthsToRepay, repayment, totalInterest } from './maths.ts'
import { input, type Calculator } from './types.ts'
import { years, yearsAndMonths } from './words.ts'

export const debtPay: Calculator = {
  id: 'debtpay',
  inputs: [
    input('b', 'Balance', 5000, 100, 100000, 100, '€'),
    input('apr', 'Interest (APR)', 20, 0, 35, 0.5, '%'),
    input('p', 'Monthly payment', 250, 10, 5000, 10, '€'),
  ],
  whatIfs: [input('x', 'Pay extra each month', 0, 0, 1000, 10, '€')],
  run(v) {
    const monthlyRate = monthlyFromYearly(v.apr)
    const payment = v.p + (v.x || 0)
    const months = monthsToRepay(v.b, monthlyRate, payment)
    const never = months === Infinity
    const interest = never ? null : totalInterest(v.b, monthlyRate, payment, months)
    const tooLong = !never && months > MAX_MONTHS
    return {
      label: 'Debt free in',
      value: never
        ? 'Never at this repayment'
        : tooLong
          ? 'Over 100 years'
          : yearsAndMonths(months),
      line: never
        ? 'The payment does not cover the interest. Try a higher amount.'
        : tooLong
          ? 'Payment too low to clear this debt in a reasonable time.'
          : `You would pay about ${euro(interest!)} in interest. The APR is a yearly rate: about ${(monthlyRate * 100).toFixed(2)}% a month.`,
      rows: [['Total interest', interest == null ? '—' : euro(interest)]],
      goal: null,
      numbers: {
        Months_To_Clear: never ? 'Never' : months,
        Total_Interest: interest ?? '—',
        Monthly_Rate: monthlyRate,
      },
    }
  },
}

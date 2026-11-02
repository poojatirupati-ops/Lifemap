import { euro } from '../../lib/format.ts'
import { MAX_MONTHS, monthlyFromYearly, monthsToRepay, totalInterest } from './maths.ts'
import type { Calculator } from './types.ts'
import { yearsAndMonths } from './words.ts'

export const debtPay: Calculator = {
  id: 'debtpay',
  inputs: [
    { key: 'b', label: 'Balance', example: 5000, min: 100, max: 100000, step: 100, unit: '€' },
    { key: 'apr', label: 'Interest (APR)', example: 20, min: 0, max: 35, step: 0.5, unit: '%' },
    { key: 'p', label: 'Monthly payment', example: 250, min: 10, max: 5000, step: 10, unit: '€' },
  ],
  whatIfs: [
    { key: 'x', label: 'Pay extra each month', example: 0, min: 0, max: 1000, step: 10, unit: '€' },
  ],
  run(figures) {
    const { b: balance, apr, p: monthlyPayment, x: extra = 0 } = figures
    const monthlyRate = monthlyFromYearly(apr)
    const payment = monthlyPayment + extra
    const months = monthsToRepay(balance, monthlyRate, payment)
    const never = months === Infinity
    const interest = never ? null : totalInterest(balance, monthlyRate, payment, months)
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

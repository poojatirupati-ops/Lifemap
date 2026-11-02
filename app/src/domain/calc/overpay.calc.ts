import { euro } from '../../lib/format.ts'
import { monthsToRepay, repayment, totalInterest } from './maths.ts'
import type { Calculator } from './types.ts'
import { repaidIn } from './words.ts'
import { rate, statedPayment } from './home.shared.ts'

export const overpay: Calculator = {
  id: 'overpay',
  inputs: [
    {
      key: 'bal',
      label: 'Mortgage balance',
      example: 250000,
      min: 20000,
      max: 1000000,
      step: 1000,
      unit: '€',
    },
    rate('Interest rate', 4),
    { key: 'yrs', label: 'Years left', example: 25, min: 3, max: 35, step: 1, unit: 'y' },
    { key: 'x', label: 'Extra each month', example: 200, min: 0, max: 2000, step: 25, unit: '€' },
  ],
  run(figures, context) {
    const { bal: balance, rate: ratePercent, yrs: yearsLeft, x: extra } = figures
    const monthlyRate = ratePercent / 1200
    const stated = statedPayment(context, ['bal', 'rate', 'yrs'])
    const payment = stated?.amount || repayment(balance, monthlyRate, yearsLeft * 12)
    const now = monthsToRepay(balance, monthlyRate, payment)
    const withExtra = monthsToRepay(balance, monthlyRate, payment + extra)
    const both = now !== Infinity && withExtra !== Infinity
    const interest = (months: number, pay: number) =>
      months === Infinity ? null : totalInterest(balance, monthlyRate, pay, months)
    const interestNow = interest(now, payment)
    const interestWithExtra = interest(withExtra, payment + extra)
    const saved = both ? interestNow! - interestWithExtra! : null
    const sooner = both ? now - withExtra : null
    const from = stated ? ` (from ${stated.from})` : ''
    return {
      label: 'Mortgage free sooner by',
      value: !both ? '—' : sooner === 0 ? 'No change' : repaidIn(sooner!),
      line:
        now === Infinity
          ? `Your repayment of ${euro(payment)} doesn't clear the mortgage: not at this repayment.`
          : `Paying ${euro(extra)} extra a month on top of ${euro(payment)}${from} could save about ${saved == null ? '—' : euro(saved)} in interest (illustrative; check your lender's overpayment terms).`,
      rows: [
        ['Mortgage free now in', repaidIn(now, 'Not at this repayment')],
        ['With the extra', repaidIn(withExtra, '—')],
        ['Interest saved', saved == null ? '—' : euro(saved)],
      ],
      goal:
        withExtra === Infinity
          ? null
          : { kind: 'mfree', name: 'Mortgage free', emoji: '🔑', years: Math.ceil(withExtra / 12) },
      numbers: {
        Months_Now: now === Infinity ? 'Never' : now,
        Months_With_Extra: withExtra === Infinity ? 'Never' : withExtra,
        Months_Sooner: sooner ?? '—',
        Interest_Saved: saved ?? '—',
        Interest_Now: interestNow ?? '—',
        Interest_With_Extra: interestWithExtra ?? '—',
        Repayment_Now: payment,
        Plan_Goal_Years: withExtra === Infinity ? '—' : Math.ceil(withExtra / 12),
      },
    }
  },
}

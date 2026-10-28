import { euro } from '../../lib/format.ts'
import { monthsToRepay, repayment, totalInterest } from './maths.ts'
import { input, type Calculator } from './types.ts'
import { repaidIn, years } from './words.ts'
import { rate, statedPayment } from './home.shared.ts'

export const overpay: Calculator = {
  id: 'overpay',
  inputs: [
    input('bal', 'Mortgage balance', 250000, 20000, 1000000, 1000, '€'),
    rate('Interest rate', 4),
    input('yrs', 'Years left', 25, 3, 35, 1, 'y'),
    input('x', 'Extra each month', 200, 0, 2000, 25, '€'),
  ],
  run(v, context) {
    const monthlyRate = v.rate / 1200
    const stated = statedPayment(context, ['bal', 'rate', 'yrs'])
    const payment = stated?.amount || repayment(v.bal, monthlyRate, v.yrs * 12)
    const now = monthsToRepay(v.bal, monthlyRate, payment)
    const withExtra = monthsToRepay(v.bal, monthlyRate, payment + v.x)
    const both = now !== Infinity && withExtra !== Infinity
    const interest = (months: number, pay: number) =>
      months === Infinity ? null : totalInterest(v.bal, monthlyRate, pay, months)
    const interestNow = interest(now, payment)
    const interestWithExtra = interest(withExtra, payment + v.x)
    const saved = both ? interestNow! - interestWithExtra! : null
    const sooner = both ? now - withExtra : null
    const from = stated ? ` (from ${stated.from})` : ''
    return {
      label: 'Mortgage free sooner by',
      value: !both ? '—' : sooner === 0 ? 'No change' : repaidIn(sooner!),
      line:
        now === Infinity
          ? `Your repayment of ${euro(payment)} doesn't clear the mortgage: not at this repayment.`
          : `Paying ${euro(v.x)} extra a month on top of ${euro(payment)}${from} could save about ${saved == null ? '—' : euro(saved)} in interest (illustrative; check your lender's overpayment terms).`,
      rows: [
        ['Mortgage free now in', repaidIn(now, 'Not at this repayment')],
        ['With the extra', repaidIn(withExtra, '—')],
        ['Interest saved', saved == null ? '—' : euro(saved)],
      ],
      goal:
        withExtra === Infinity
          ? null
          : { kind: 'mfree', name: 'Mortgage free', em: '🔑', years: Math.ceil(withExtra / 12) },
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

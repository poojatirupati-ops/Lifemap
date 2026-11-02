import { euro } from '../../lib/format.ts'
import { monthsToRepay, repayment, totalInterest } from './maths.ts'
import type { Calculator } from './types.ts'
import { repaidIn, signed, years } from './words.ts'
import { homeGoal, rate, statedPayment } from './home.shared.ts'

export const repaymentTool: Calculator = {
  id: 'repayment',
  inputs: [
    {
      key: 'loan',
      label: 'Mortgage amount',
      example: 300000,
      min: 50000,
      max: 1000000,
      step: 1000,
      unit: '€',
    },
    rate('Interest rate', 4),
    {
      key: 'term',
      label: 'Term (years left to repay)',
      example: 30,
      min: 5,
      max: 35,
      step: 1,
      unit: 'y',
    },
  ],
  whatIfs: [
    { key: 'dr', label: 'If rates changed by', example: 0, min: -2, max: 3, step: 0.25, unit: '%' },
  ],
  run(figures, context) {
    const { loan, rate: ratePercent, term, dr: rateChange = 0 } = figures
    const monthlyRate = ratePercent / 100 / 12
    const formula = repayment(loan, monthlyRate, term * 12)
    const stated = statedPayment(context, ['loan', 'rate', 'term'])
    const base = stated?.amount || formula
    const newRate = Math.max(0, ratePercent + rateChange)
    const changed = base + repayment(loan, newRate / 1200, term * 12) - formula
    const months = monthsToRepay(loan, monthlyRate, base)
    const interest = months === Infinity ? null : totalInterest(loan, monthlyRate, base, months)
    const goalAmount = Math.round((loan * (1 - context.rules.home.ltv)) / context.rules.home.ltv)
    const numbers = {
      Monthly_Repayment: base,
      Formula_Repayment: formula,
      Months_To_Pay: months === Infinity ? 'Never' : months,
      Total_Interest: interest ?? '—',
      Total_Repaid: interest == null ? '—' : loan + interest,
      New_Rate: newRate / 100,
      Repayment_If_Changed: changed,
      Change_Per_Year: (changed - base) * 12,
      Plan_Goal_Amount: goalAmount,
    }
    const goal = homeGoal(goalAmount)
    if (rateChange) {
      const now = stated ? `the ${euro(stated.amount)} on ${stated.from}` : 'now'
      const approx = stated
        ? 'With a stated repayment this is an approximation: it moves by the same amount as the standard formula would.'
        : ''
      return {
        label: `If your rate changed to ${newRate.toFixed(2)}%`,
        value: euro(changed),
        line: `What-if: your repayment would be about ${euro(changed)} a month, ${euro(Math.abs(changed - base))}${changed >= base ? ' more' : ' less'} than ${now}. ${approx}`,
        rows: [
          ['Repayment now', euro(base)],
          ['Change over a year', signed((changed - base) * 12)],
        ],
        goal,
        numbers,
      }
    }
    const lenderNote =
      stated && Math.abs(stated.amount - formula) >= 5
        ? ` The standard formula on these figures gives about ${euro(formula)}; we use your lender's figure.`
        : ''
    return {
      label: stated ? 'Your monthly repayment' : 'Monthly repayment',
      value: euro(base),
      line: stated
        ? `From ${stated.from}.${lenderNote}`
        : `Over ${years(term)} at ${ratePercent.toFixed(2)}%, using the standard repayment formula. The rate is a yearly rate, compounded monthly (the way lenders quote mortgage rates).`,
      rows: [
        ['Mortgage free in', repaidIn(months)],
        ['Total interest', interest == null ? '—' : euro(interest)],
        ['Total repaid', interest == null ? '—' : euro(loan + interest)],
      ],
      goal,
      numbers,
    }
  },
}

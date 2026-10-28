import { euro } from '../../lib/format.ts'
import { monthsToRepay, repayment, totalInterest } from './maths.ts'
import { input, type Calculator } from './types.ts'
import { repaidIn, signed, years } from './words.ts'
import { homeGoal, rate, statedPayment } from './home.shared.ts'

export const repaymentTool: Calculator = {
  id: 'repayment',
  inputs: [
    input('loan', 'Mortgage amount', 300000, 50000, 1000000, 1000, '€'),
    rate('Interest rate', 4),
    input('term', 'Term (years left to repay)', 30, 5, 35, 1, 'y'),
  ],
  whatIfs: [input('dr', 'If rates changed by', 0, -2, 3, 0.25, '%')],
  run(v, context) {
    const monthlyRate = v.rate / 100 / 12
    const formula = repayment(v.loan, monthlyRate, v.term * 12)
    const stated = statedPayment(context, ['loan', 'rate', 'term'])
    const base = stated?.amount || formula
    const newRate = Math.max(0, v.rate + (v.dr || 0))
    const changed = base + repayment(v.loan, newRate / 1200, v.term * 12) - formula
    const months = monthsToRepay(v.loan, monthlyRate, base)
    const interest = months === Infinity ? null : totalInterest(v.loan, monthlyRate, base, months)
    const goalAmount = Math.round((v.loan * (1 - context.rules.home.ltv)) / context.rules.home.ltv)
    const numbers = {
      Monthly_Repayment: base,
      Formula_Repayment: formula,
      Months_To_Pay: months === Infinity ? 'Never' : months,
      Total_Interest: interest ?? '—',
      Total_Repaid: interest == null ? '—' : v.loan + interest,
      New_Rate: newRate / 100,
      Repayment_If_Changed: changed,
      Change_Per_Year: (changed - base) * 12,
      Plan_Goal_Amount: goalAmount,
    }
    const goal = homeGoal(goalAmount)
    if (v.dr) {
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
        : `Over ${years(v.term)} at ${v.rate.toFixed(2)}%, using the standard repayment formula. The rate is a yearly rate, compounded monthly (the way lenders quote mortgage rates).`,
      rows: [
        ['Mortgage free in', repaidIn(months)],
        ['Total interest', interest == null ? '—' : euro(interest)],
        ['Total repaid', interest == null ? '—' : euro(v.loan + interest)],
      ],
      goal,
      numbers,
    }
  },
}

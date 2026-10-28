import { euro } from '../../lib/format.ts'
import { balanceAfter, repayment } from './maths.ts'
import { input, type Calculator } from './types.ts'
import { BALANCE_YEARS, NOT_COVERED } from './protect.shared.ts'

export const mortgageProtect: Calculator = {
  id: 'mortgageprotect',
  inputs: [
    input('bal', 'Mortgage balance', 250000, 20000, 1000000, 5000, '€'),
    input('rate', 'Interest rate', 4, 1, 8, 0.05, '%'),
    input('y', 'Years left', 25, 5, 35, 1, 'y'),
  ],
  run(v, context) {
    const monthlyRate = v.rate / 1200
    const stated = context.untouched(['bal', 'rate', 'y']) ? context.statedMortgagePayment : null
    const payment = stated?.amount || repayment(v.bal, monthlyRate, v.y * 12)
    const notCovered = payment <= v.bal * monthlyRate
    const balances = BALANCE_YEARS.map((after) =>
      notCovered ? '—' : Math.max(0, balanceAfter(v.bal, monthlyRate, payment, after * 12)),
    )
    return {
      label: 'Cover needed today',
      value: euro(v.bal),
      line: notCovered
        ? NOT_COVERED
        : `Mortgage protection usually reduces as your mortgage does. Illustrative balance over time, repaying ${euro(payment)} a month:`,
      rows: balances.map((balance, i) => [
        `In ${BALANCE_YEARS[i]} years`,
        typeof balance === 'number' ? euro(balance) : balance,
      ]),
      goal: null,
      numbers: {
        Cover_Today: v.bal,
        Warning: notCovered ? NOT_COVERED : '',
        Balance_Year_1: balances[0],
        Balance_Year_2: balances[1],
        Balance_Year_3: balances[2],
        Repayment: payment,
      },
    }
  },
}

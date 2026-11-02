import { euro } from '../../lib/format.ts'
import { balanceAfter, repayment } from './maths.ts'
import type { Calculator } from './types.ts'

const BALANCE_YEARS = [5, 10, 15]
const NOT_COVERED = "Your repayment doesn't cover the interest: please check the figures."

export const mortgageProtect: Calculator = {
  id: 'mortgageprotect',
  inputs: [
    {
      key: 'bal',
      label: 'Mortgage balance',
      example: 250000,
      min: 20000,
      max: 1000000,
      step: 5000,
      unit: '€',
    },
    { key: 'rate', label: 'Interest rate', example: 4, min: 1, max: 8, step: 0.05, unit: '%' },
    { key: 'y', label: 'Years left', example: 25, min: 5, max: 35, step: 1, unit: 'y' },
  ],
  run(figures, context) {
    const { bal: balance, rate: ratePercent, y: yearsLeft } = figures
    const monthlyRate = ratePercent / 1200
    const stated = context.untouched(['bal', 'rate', 'y']) ? context.statedMortgagePayment : null
    const payment = stated?.amount || repayment(balance, monthlyRate, yearsLeft * 12)
    const notCovered = payment <= balance * monthlyRate
    const balances = BALANCE_YEARS.map((after) =>
      notCovered ? '—' : Math.max(0, balanceAfter(balance, monthlyRate, payment, after * 12)),
    )
    return {
      label: 'Cover needed today',
      value: euro(balance),
      line: notCovered
        ? NOT_COVERED
        : `Mortgage protection usually reduces as your mortgage does. Illustrative balance over time, repaying ${euro(payment)} a month:`,
      rows: balances.map((balance, i) => [
        `In ${BALANCE_YEARS[i]} years`,
        typeof balance === 'number' ? euro(balance) : balance,
      ]),
      goal: null,
      numbers: {
        Cover_Today: balance,
        Warning: notCovered ? NOT_COVERED : '',
        Balance_Year_1: balances[0],
        Balance_Year_2: balances[1],
        Balance_Year_3: balances[2],
        Repayment: payment,
      },
    }
  },
}

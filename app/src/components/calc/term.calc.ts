import { euro } from '../../lib/format.ts'
import { mortgageRepayment } from './maths.ts'
import { input, type Calculator } from './types.ts'
import { rate } from './home.shared.ts'

export const term: Calculator = {
  id: 'term',
  inputs: [
    input('loan', 'Mortgage amount', 300000, 50000, 1000000, 1000, '€'),
    rate('Interest rate', 4),
    input('a', 'Term A', 25, 5, 35, 1, 'y'),
    input('b', 'Term B', 35, 5, 35, 1, 'y'),
  ],
  run({ loan, rate: r, a, b }) {
    const monthlyA = mortgageRepayment(loan, r, a)
    const monthlyB = mortgageRepayment(loan, r, b)
    const interestA = monthlyA * a * 12 - loan
    const interestB = monthlyB * b * 12 - loan
    return {
      label: 'Interest difference',
      value: euro(Math.abs(interestB - interestA)),
      line:
        a === b
          ? 'Both terms are the same.'
          : `The ${Math.min(a, b)}-year term costs more each month but less interest overall.`,
      rows: [
        [`${a}-year monthly`, euro(monthlyA)],
        [`${b}-year monthly`, euro(monthlyB)],
        [`${a}-year total interest`, euro(interestA)],
        [`${b}-year total interest`, euro(interestB)],
      ],
      goal: null,
      numbers: {
        Interest_Difference: Math.abs(interestB - interestA),
        Monthly_A: monthlyA,
        Monthly_B: monthlyB,
        Interest_A: interestA,
        Interest_B: interestB,
      },
    }
  },
}

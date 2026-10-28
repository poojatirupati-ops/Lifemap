import { euro } from '../../lib/format.ts'
import { input, type Calculator } from './types.ts'
import { afterFees } from './invest.shared.ts'

export const fees: Calculator = {
  id: 'fees',
  inputs: [
    input('p', 'Amount invested', 50000, 1000, 1000000, 100, '€'),
    input('y', 'Years', 20, 1, 40, 1, 'y'),
    input('g', 'Growth a year (before fees)', 5, 0, 8, 0.5, '%'),
    input('a', 'Fee A a year', 0.5, 0, 3, 0.05, '%'),
    input('b', 'Fee B a year', 1.5, 0, 3, 0.05, '%'),
  ],
  run({ p: amount, y: term, g: rate, a: feeA, b: feeB }) {
    const withFee = (fee: number) => amount * (1 + afterFees(rate, fee)) ** term
    const valueA = withFee(feeA)
    const valueB = withFee(feeB)
    const difference = Math.abs(valueA - valueB)
    return {
      label: 'Difference',
      value: euro(difference),
      line: `A ${Math.abs(feeB - feeA).toFixed(2)}% difference in yearly fees could change the outcome by about ${euro(difference)}. Before tax.`,
      rows: [
        [`With ${feeA}% fees`, euro(valueA)],
        [`With ${feeB}% fees`, euro(valueB)],
      ],
      goal: null,
      numbers: {
        Difference: difference,
        Value_With_Fee_A: valueA,
        Value_With_Fee_B: valueB,
        Fee_Gap: Math.abs(feeB - feeA) / 100,
      },
    }
  },
}

import { euro } from '../../lib/format.ts'
import type { Calculator } from './types.ts'
import { afterFees } from './invest.shared.ts'

export const fees: Calculator = {
  id: 'fees',
  inputs: [
    {
      key: 'p',
      label: 'Amount invested',
      example: 50000,
      min: 1000,
      max: 1000000,
      step: 100,
      unit: '€',
    },
    { key: 'y', label: 'Years', example: 20, min: 1, max: 40, step: 1, unit: 'y' },
    {
      key: 'g',
      label: 'Growth a year (before fees)',
      example: 5,
      min: 0,
      max: 8,
      step: 0.5,
      unit: '%',
    },
    { key: 'a', label: 'Fee A a year', example: 0.5, min: 0, max: 3, step: 0.05, unit: '%' },
    { key: 'b', label: 'Fee B a year', example: 1.5, min: 0, max: 3, step: 0.05, unit: '%' },
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

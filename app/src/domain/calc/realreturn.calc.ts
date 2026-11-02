import { euro, percent } from '../../lib/format.ts'
import { grownLump } from './maths.ts'
import type { Calculator } from './types.ts'
import { beforeTax, NO_INFLATION } from './words.ts'

export const realReturn: Calculator = {
  id: 'realreturn',
  inputs: [
    { key: 'p', label: 'Amount', example: 20000, min: 500, max: 500000, step: 100, unit: '€' },
    {
      key: 'r',
      label: 'Return a year (before inflation)',
      example: 5,
      min: 0,
      max: 10,
      step: 0.25,
      unit: '%',
    },
    { key: 'y', label: 'Years', example: 15, min: 1, max: 40, step: 1, unit: 'y' },
  ],
  run({ p: amount, r: rate, y: term }, context) {
    const future = grownLump(amount, rate, term)
    const { inflation } = context
    if (inflation == null) {
      return {
        label: 'Future value',
        value: euro(future),
        line: `Choose your inflation rate to see the real return and what it's worth in today's money. ${beforeTax(context.rules)}`,
        rows: [
          ['Future value', euro(future)],
          ["In today's money", NO_INFLATION],
          ['Real return a year', NO_INFLATION],
        ],
        goal: null,
        numbers: { Future_Value: future, Value_Today: NO_INFLATION, Real_Return: NO_INFLATION },
      }
    }
    const real = (1 + rate / 100) / (1 + inflation) - 1 // exact, not growth minus inflation
    const today = future / (1 + inflation) ** term
    return {
      label: "In today's money",
      value: euro(today),
      line: `A ${+rate.toFixed(2)}% return with prices rising ${percent(inflation)} is really about ${(real * 100).toFixed(1)}% a year. ${beforeTax(context.rules)}`,
      rows: [
        ['Future value', euro(future)],
        ['Real return a year', +(real * 100).toFixed(2) + '%'],
        ["Value in today's money", euro(today)],
      ],
      goal: null,
      numbers: { Future_Value: future, Value_Today: today, Real_Return: real },
    }
  },
}

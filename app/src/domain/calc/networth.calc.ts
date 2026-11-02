import { euro } from '../../lib/format.ts'
import type { Calculator } from './types.ts'

export const netWorth: Calculator = {
  id: 'networth',
  inputs: [
    { key: 'sav', label: 'Savings', example: 15000, min: 0, max: 1000000, step: 500, unit: '€' },
    {
      key: 'inv',
      label: 'Investments',
      example: 10000,
      min: 0,
      max: 2000000,
      step: 1000,
      unit: '€',
    },
    { key: 'pen', label: 'Pensions', example: 60000, min: 0, max: 3000000, step: 1000, unit: '€' },
    {
      key: 'prop',
      label: 'Property value',
      example: 350000,
      min: 0,
      max: 5000000,
      step: 5000,
      unit: '€',
    },
    {
      key: 'mort',
      label: 'Mortgage',
      example: 250000,
      min: 0,
      max: 3000000,
      step: 5000,
      unit: '€',
    },
    {
      key: 'loans',
      label: 'Other loans',
      example: 8000,
      min: 0,
      max: 500000,
      step: 500,
      unit: '€',
    },
  ],
  run({ sav, inv, pen, prop, mort, loans }) {
    const own = sav + inv + pen + prop
    const owe = mort + loans
    return {
      label: 'Your net worth',
      value: euro(own - owe),
      line: 'Everything you own minus everything you owe. Pensions are before tax; property is before selling costs. Track it once or twice a year.',
      rows: [
        ['You own', euro(own)],
        ['You owe', euro(owe)],
      ],
      goal: null,
      numbers: { Net_Worth: own - owe, You_Own: own, You_Owe: owe },
    }
  },
}

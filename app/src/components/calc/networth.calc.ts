import { euro } from '../../lib/format.ts'
import { input, type Calculator } from './types.ts'

export const netWorth: Calculator = {
  id: 'networth',
  inputs: [
    input('sav', 'Savings', 15000, 0, 1000000, 500, '€'),
    input('inv', 'Investments', 10000, 0, 2000000, 1000, '€'),
    input('pen', 'Pensions', 60000, 0, 3000000, 1000, '€'),
    input('prop', 'Property value', 350000, 0, 5000000, 5000, '€'),
    input('mort', 'Mortgage', 250000, 0, 3000000, 5000, '€'),
    input('loans', 'Other loans', 8000, 0, 500000, 500, '€'),
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

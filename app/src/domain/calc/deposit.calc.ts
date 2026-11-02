import { euro } from '../../lib/format.ts'
import { stampDuty } from './maths.ts'
import type { Calculator } from './types.ts'
import { yearsAndMonths } from './words.ts'
import { STAMP_NOTE, fees } from './home.shared.ts'

export const deposit: Calculator = {
  id: 'deposit',
  inputs: [
    {
      key: 'price',
      label: 'Home price',
      example: 350000,
      min: 100000,
      max: 1000000,
      step: 5000,
      unit: '€',
    },
    { key: 'pc', label: 'Deposit needed', example: 10, min: 10, max: 30, step: 1, unit: '%' },
    {
      key: 'saved',
      label: 'Saved so far',
      example: 12000,
      min: 0,
      max: 200000,
      step: 500,
      unit: '€',
    },
    { key: 'mo', label: 'Monthly saving', example: 800, min: 50, max: 5000, step: 50, unit: '€' },
  ],
  whatIfs: [
    {
      key: 'xmo',
      label: 'Save extra each month',
      example: 0,
      min: 0,
      max: 1500,
      step: 50,
      unit: '€',
    },
  ],
  run(figures, context) {
    const { price, pc: depositPercent, saved, mo: monthlySaving, xmo: extraSaving = 0 } = figures
    const share = (price * depositPercent) / 100
    const duty = stampDuty(context.rules, price)
    const buyingFees = fees(context)
    const need = share + duty + buyingFees
    const left = Math.max(0, need - saved)
    const monthly = monthlySaving + extraSaving
    const months = left === 0 ? 0 : Math.ceil(left / monthly)
    const goalYears = Math.max(1, Math.ceil(months / 12))
    const closing = left
      ? `Saving ${euro(monthly)} a month closes the gap (no interest and no house-price rises assumed). `
      : ''
    return {
      label: 'Time to your deposit',
      value: left ? yearsAndMonths(months) : 'You have your deposit',
      line: `You need ${euro(need)} (deposit ${euro(share)}, stamp duty ${euro(duty)} and fees ${euro(buyingFees)}) and have ${euro(saved)}. ${closing}The Central Bank minimum deposit is 10%. ${STAMP_NOTE}`,
      rows: [
        ['Total you need', euro(need)],
        ['Deposit', euro(share)],
        ['Stamp duty', euro(duty)],
        ['Still to save', euro(left)],
      ],
      goal: {
        kind: 'spend',
        goalKind: 'home',
        name: 'Home deposit',
        emoji: '🔑',
        amount: Math.round(need),
        saved: saved,
        years: goalYears,
      },
      numbers: {
        Months_To_Deposit: months,
        Total_Needed: need,
        Deposit_Needed: share,
        Stamp_Duty: duty,
        Still_To_Save: left,
        Plan_Goal_Amount: Math.round(need),
        Plan_Goal_Saved: saved,
        Plan_Goal_Years: goalYears,
      },
    }
  },
}

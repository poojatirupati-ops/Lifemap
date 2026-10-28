import { euro } from '../../lib/format.ts'
import { stampDuty } from './maths.ts'
import { input, type Calculator } from './types.ts'
import { years, yearsAndMonths } from './words.ts'
import { STAMP_NOTE, fees } from './home.shared.ts'

export const deposit: Calculator = {
  id: 'deposit',
  inputs: [
    input('price', 'Home price', 350000, 100000, 1000000, 5000, '€'),
    input('pc', 'Deposit needed', 10, 10, 30, 1, '%'),
    input('saved', 'Saved so far', 12000, 0, 200000, 500, '€'),
    input('mo', 'Monthly saving', 800, 50, 5000, 50, '€'),
  ],
  whatIfs: [input('xmo', 'Save extra each month', 0, 0, 1500, 50, '€')],
  run(v, context) {
    const share = (v.price * v.pc) / 100
    const duty = stampDuty(context.rules, v.price)
    const buyingFees = fees(context)
    const need = share + duty + buyingFees
    const left = Math.max(0, need - v.saved)
    const monthly = v.mo + (v.xmo || 0)
    const months = left === 0 ? 0 : Math.ceil(left / monthly)
    const goalYears = Math.max(1, Math.ceil(months / 12))
    const closing = left
      ? `Saving ${euro(monthly)} a month closes the gap (no interest and no house-price rises assumed). `
      : ''
    return {
      label: 'Time to your deposit',
      value: left ? yearsAndMonths(months) : 'You have your deposit',
      line: `You need ${euro(need)} (deposit ${euro(share)}, stamp duty ${euro(duty)} and fees ${euro(buyingFees)}) and have ${euro(v.saved)}. ${closing}The Central Bank minimum deposit is 10%. ${STAMP_NOTE}`,
      rows: [
        ['Total you need', euro(need)],
        ['Deposit', euro(share)],
        ['Stamp duty', euro(duty)],
        ['Still to save', euro(left)],
      ],
      goal: {
        kind: 'spend',
        k: 'home',
        name: 'Home deposit',
        em: '🔑',
        amount: Math.round(need),
        saved: v.saved,
        years: goalYears,
      },
      numbers: {
        Months_To_Deposit: months,
        Total_Needed: need,
        Deposit_Needed: share,
        Stamp_Duty: duty,
        Still_To_Save: left,
        Plan_Goal_Amount: Math.round(need),
        Plan_Goal_Saved: v.saved,
        Plan_Goal_Years: goalYears,
      },
    }
  },
}

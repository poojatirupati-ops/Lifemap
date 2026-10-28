import { euro } from '../../lib/format.ts'
import { input, type Calculator } from './types.ts'

export const lifeCover: Calculator = {
  id: 'lifecover',
  inputs: [
    input('inc', 'Your gross yearly income', 60000, 0, 300000, 1000, '€'),
    input('y', 'Years your family would need support', 15, 1, 30, 1, 'y'),
    input('mort', 'Mortgage balance', 250000, 0, 1000000, 5000, '€'),
    input('mp', 'Is the mortgage cleared by mortgage protection? (most are)', 1, 0, 1, 1, 'yn'),
    input('debt', 'Other debts', 10000, 0, 200000, 1000, '€'),
    input('sav', 'Savings & investments', 20000, 0, 1000000, 1000, '€'),
    input('ex', 'Existing life cover (incl. through work)', 100000, 0, 2000000, 10000, '€'),
    input('surv', "State survivor's pension a week (0 if none)", 259.5, 0, 400, 0.5, '€'),
  ],
  run(v, context) {
    const share = Number(context.assumption('lifeShare'))
    const replacement = v.inc * share * v.y
    const need = Math.max(0, v.inc * share - v.surv * context.rules.sp.weeks) * v.y
    const debts = (v.mp ? 0 : v.mort) + v.debt
    const have = v.ex + v.sav
    const gap = Math.max(0, need + debts - have)
    return {
      label: 'Illustrative cover gap',
      value: euro(gap),
      line:
        gap > 0
          ? "A rough estimate of the gap between what your family might need and what you have. A protection expert can refine this. Cohabiting partners can now qualify for the State Bereaved Partner's Pension."
          : 'Your existing cover and savings look like they meet this rough estimate.',
      rows: [
        ['Income your family would need (after the State pension)', euro(need)],
        ['Debts to clear', euro(debts)],
        ['Existing cover + savings', euro(have)],
        [
          `Income replacement before State pension (${Math.round(share * 100)}%)`,
          euro(replacement),
        ],
      ],
      goal:
        gap > 0
          ? {
              kind: 'need',
              need: 'life',
              name: 'Life cover need (for your adviser)',
              em: '🛡️',
              amount: gap,
            }
          : null,
      numbers: {
        Cover_Gap: gap,
        Income_Need: need,
        Debts_To_Clear: debts,
        Already_Have: have,
        Income_Replacement: replacement,
        Plan_Goal_Need: gap,
      },
    }
  },
}

import { euro } from '../../lib/format.ts'
import type { Calculator } from './types.ts'

export const lifeCover: Calculator = {
  id: 'lifecover',
  inputs: [
    {
      key: 'inc',
      label: 'Your gross yearly income',
      example: 60000,
      min: 0,
      max: 300000,
      step: 1000,
      unit: '€',
    },
    {
      key: 'y',
      label: 'Years your family would need support',
      example: 15,
      min: 1,
      max: 30,
      step: 1,
      unit: 'y',
    },
    {
      key: 'mort',
      label: 'Mortgage balance',
      example: 250000,
      min: 0,
      max: 1000000,
      step: 5000,
      unit: '€',
    },
    {
      key: 'mp',
      label: 'Is the mortgage cleared by mortgage protection? (most are)',
      example: 1,
      min: 0,
      max: 1,
      step: 1,
      unit: 'yn',
    },
    {
      key: 'debt',
      label: 'Other debts',
      example: 10000,
      min: 0,
      max: 200000,
      step: 1000,
      unit: '€',
    },
    {
      key: 'sav',
      label: 'Savings & investments',
      example: 20000,
      min: 0,
      max: 1000000,
      step: 1000,
      unit: '€',
    },
    {
      key: 'ex',
      label: 'Existing life cover (incl. through work)',
      example: 100000,
      min: 0,
      max: 2000000,
      step: 10000,
      unit: '€',
    },
    {
      key: 'surv',
      label: "State survivor's pension a week (0 if none)",
      example: 259.5,
      min: 0,
      max: 400,
      step: 0.5,
      unit: '€',
    },
  ],
  run(figures, context) {
    const {
      inc: income,
      y: supportYears,
      mort: mortgage,
      mp: mortgageProtected,
      debt: otherDebts,
      sav: savings,
      ex: existingCover,
      surv: survivorsPensionWeekly,
    } = figures
    const share = Number(context.assumption('lifeShare'))
    const replacement = income * share * supportYears
    const need =
      Math.max(0, income * share - survivorsPensionWeekly * context.rules.sp.weeks) * supportYears
    const debts = (mortgageProtected ? 0 : mortgage) + otherDebts
    const have = existingCover + savings
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
              emoji: '🛡️',
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

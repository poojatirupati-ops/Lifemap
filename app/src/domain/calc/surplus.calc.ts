import { euro } from '../../lib/format.ts'
import type { Calculator } from './types.ts'

export const surplus: Calculator = {
  id: 'surplus',
  inputs: [
    {
      key: 'inc',
      label: 'Take-home pay per month',
      example: 3500,
      min: 500,
      max: 20000,
      step: 50,
      unit: '€',
    },
    {
      key: 'ess',
      label: 'Essentials (rent/mortgage, bills, food)',
      example: 2000,
      min: 0,
      max: 15000,
      step: 50,
      unit: '€',
    },
    {
      key: 'life',
      label: 'Lifestyle spending',
      example: 800,
      min: 0,
      max: 10000,
      step: 50,
      unit: '€',
    },
    { key: 'debt', label: 'Debt repayments', example: 200, min: 0, max: 5000, step: 25, unit: '€' },
  ],
  run({ inc, ess, life, debt }) {
    const out = ess + life + debt
    const left = inc - out
    return {
      label: 'Monthly surplus',
      value: euro(left),
      line:
        left > 0
          ? `About ${Math.round((left / inc) * 100)}% of your take-home pay is free for goals.`
          : left === 0
            ? 'Nothing left over this month.'
            : 'Spending is above income right now. Small changes to lifestyle spending can help.',
      rows: [
        ['Take-home', euro(inc)],
        ['Going out', euro(out)],
      ],
      goal:
        left > 0
          ? {
              kind: 'pot',
              name: 'Save my surplus',
              emoji: '🐷',
              amount: Math.round(left * 12),
              years: 1,
            }
          : null,
      numbers: {
        Surplus: left,
        Going_Out: out,
        Plan_Goal_Amount: left > 0 ? Math.round(left * 12) : '—',
      },
    }
  },
}

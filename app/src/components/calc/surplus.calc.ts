import { euro } from '../../lib/format.ts'
import { input, type Calculator } from './types.ts'
import { years } from './words.ts'
import { takeHome } from './everyday.shared.ts'

export const surplus: Calculator = {
  id: 'surplus',
  inputs: [
    takeHome,
    input('ess', 'Essentials (rent/mortgage, bills, food)', 2000, 0, 15000, 50, '€'),
    input('life', 'Lifestyle spending', 800, 0, 10000, 50, '€'),
    input('debt', 'Debt repayments', 200, 0, 5000, 25, '€'),
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
              em: '🐷',
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

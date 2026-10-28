import { euro } from '../../lib/format.ts'
import { input, type Calculator } from './types.ts'
import { years } from './words.ts'
import { SAFETY_GOAL_YEARS, months } from './savings.shared.ts'

export const emergency: Calculator = {
  id: 'emergency',
  tip: (context) =>
    `Ideal emergency fund: ${context.safetyMonths} months of your monthly spending.`,
  inputs: [
    input('e', 'Essential monthly spending', 2500, 500, 10000, 100, '€'),
    input('mt', 'Months you want covered', 6, 1, 12, 1, 'm'),
    input('s', 'Easy-access savings', 6250, 0, 100000, 250, '€'),
  ],
  run({ e: spending, mt: wanted, s: savings }) {
    const target = spending * wanted
    const covered = savings / spending
    const gap = Math.max(0, target - savings)
    const shown = Math.floor(covered * 10) / 10
    return {
      label: 'You currently have',
      value: shown.toFixed(1) + (shown === 1 ? ' month' : ' months'),
      line: gap
        ? `Your target is ${euro(target)} (${months(wanted)}). You are ${euro(gap)} away.`
        : `Your emergency fund covers ${months(wanted)}. Great foundation.`,
      rows: [
        ['Target emergency fund', euro(target)],
        ['Still to build', euro(gap)],
      ],
      goal:
        gap > 0
          ? {
              kind: 'safety',
              name: 'Emergency fund',
              em: '🪂',
              amount: Math.round(target),
              saved: savings,
              years: SAFETY_GOAL_YEARS,
            }
          : null,
      numbers: {
        Months_Covered: covered,
        Target: target,
        Still_To_Build: gap,
        Plan_Goal_Amount: gap > 0 ? Math.round(target) : '—',
        Plan_Goal_Saved: savings,
      },
    }
  },
}

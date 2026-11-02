import { euro } from '../../lib/format.ts'
import type { Calculator } from './types.ts'
import { months } from './words.ts'

const SAFETY_GOAL_YEARS = 2

/** The emergency fund tool's months are the plan's safety months too. */
export const isSafetyMonthsInput = (toolId: string, key: string) =>
  toolId === 'emergency' && key === 'mt'

export const emergency: Calculator = {
  id: 'emergency',
  tip: (context) =>
    `Ideal emergency fund: ${context.safetyMonths} months of your monthly spending.`,
  inputs: [
    {
      key: 'e',
      label: 'Essential monthly spending',
      example: 2500,
      min: 500,
      max: 10000,
      step: 100,
      unit: '€',
    },
    {
      key: 'mt',
      label: 'Months you want covered',
      example: 6,
      min: 1,
      max: 12,
      step: 1,
      unit: 'm',
    },
    {
      key: 's',
      label: 'Easy-access savings',
      example: 6250,
      min: 0,
      max: 100000,
      step: 250,
      unit: '€',
    },
  ],
  run({ e: spending, mt: wanted, s: savings }) {
    const target = spending * wanted
    const covered = savings / spending
    const gap = Math.max(0, target - savings)
    const shown = Math.floor(covered * 10) / 10
    return {
      label: 'You currently have',
      value: `${shown.toFixed(1)} ${shown === 1 ? 'month' : 'months'}`,
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
              emoji: '🪂',
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

// The emergency-fund read: months of essential spending in cash, or the Q7 answer when the figures are not in.
import { assumption } from '../planning/assumptions.ts'
import { essentialMonthly, householdFigures, type Household } from '../planning/householdFigures.ts'
import { rulesFor } from '../planning/rates.ts'
import { SURPRISE_QUESTION } from './questions.data.ts'
import type { Cushion, CushionLevel } from './riskMismatch.ts'

/** The surprise answer -> cushion level. */
const LEVEL_BY_ANSWER: CushionLevel[] = [
  'In place',
  'Thin',
  'None: relies on credit',
  'Not set up yet',
]

export type CushionInputs = Household & {
  /** where each figure came from; cash and essential costs must both be given */
  sources: Record<string, unknown>
  answers: Record<string, number>
}

export function cushion(plan: CushionInputs): Cushion {
  const targetMonths = assumption(plan, 'safetyMonths')
  const answer = LEVEL_BY_ANSWER[plan.answers[SURPRISE_QUESTION]] ?? null
  const fromAnswer = {
    hasFigures: false,
    months: null,
    targetMonths,
    shortfall: null,
    level: answer,
    answer,
  }
  if (!plan.sources.cash || !plan.sources.costsM) return fromAnswer

  const figures = householdFigures(plan, rulesFor(assumption(plan, 'startYear')))
  const spending = essentialMonthly(figures)
  if (spending <= 0) return fromAnswer
  const months = Math.floor((figures.cash / spending) * 10) / 10
  return {
    hasFigures: true,
    months,
    targetMonths,
    shortfall: Math.max(0, Math.round(targetMonths * spending - figures.cash)),
    level: months >= targetMonths ? 'In place' : months >= 1 ? 'Thin' : 'None',
    answer,
  }
}

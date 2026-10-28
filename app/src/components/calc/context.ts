// What a calculator reads from the plan besides its own figures.
import { assumption } from '../../domain/planning/assumptions.ts'
import { rulesFor } from '../../domain/planning/rates.ts'
import { localToday } from '../../lib/today.ts'
import type { Plan } from '../../state/types.ts'
import { valueInUse } from '../me/assumptionText.ts'
import type { CalcContext } from './types.ts'

// TODO(Q-01): these calculator fields belong in state/types.ts (Navigation)
export type CalcPlan = Plan & {
  adjInfl?: Record<string, boolean>
  /** A tool-local standard the customer picked (years you might wait, style). */
  toolPick?: Record<string, Record<string, number>>
  penExtra?: number
}

export interface PensionStatement {
  proj?: number | null
  nra: number
  projToday?: string
}

/** A "Your assumptions" value: the customer's choice, else the growth set, the standard or a planning figure. */
export const assumptionValue = (plan: Plan, key: string, today = localToday()): number | string =>
  ['planEnd', 'startYear'].includes(key)
    ? assumption(plan, key, today)
    : (valueInUse(plan, key) ?? 0)

export const pensionStatementOf = (plan: Plan) =>
  ((plan.pdocs.retire as { v?: PensionStatement } | undefined)?.v ??
    null) as PensionStatement | null

export function calcContext(plan: CalcPlan, toolId: string, today = localToday()): CalcContext {
  const value = (key: string) => assumptionValue(plan, key, today)
  const touched = (plan.calcT[toolId] ?? {}) as Record<string, boolean>
  const statedPayment = Number(plan.fin.mortPayM)
  return {
    rules: rulesFor(Number(value('startYear'))),
    inflation: plan.infl,
    wage: Number(value('wage')),
    cash: Number(value('cash')),
    planEnd: Number(value('planEnd')),
    assumption: value,
    statedMortgagePayment:
      plan.src.mortPayM && statedPayment > 0
        ? {
            amount: statedPayment,
            from: plan.src.mortPayM === 'doc' ? 'your statement' : 'your figures',
          }
        : null,
    untouched: (keys) => !keys.some((key) => touched[key]),
    pensionStatement: pensionStatementOf(plan),
    adjustForInflation: !!plan.adjInfl?.[toolId],
    safetyMonths: Number(value('safetyMonths')),
  }
}

// The plan with one or more changes made, for the report's "what could change the answer" rows.
import { produce } from 'immer'
import type { Plan } from '../../state/types.ts'
import { normalize } from '../../domain/plan/normalize.ts'
import { pensionRelief } from '../../domain/planning/pensions.ts'
import type { ReportContext } from './context.ts'

export interface Change {
  retireAge?: number
  saveM?: number
  pensionAddM?: number
  fullStatePension?: boolean
}

export function changedPlan(plan: Plan, change: Change, today: Date) {
  return produce(plan, (draft) => {
    if (change.retireAge != null) {
      draft.retireAge = change.retireAge
      draft.retireSet = true
      const retirement = draft.goals.find((goal) => goal.kind === 'retire')
      if (retirement) retirement.age = change.retireAge
      draft.figures.retireAge = change.retireAge
      draft.sources.retireAge ||= 'pre'
    }
    if (change.saveM != null) {
      draft.monthlySaving = change.saveM
      draft.savingAtRule = true
    }
    if (change.pensionAddM) {
      draft.figures.pensionM = (Number(draft.figures.pensionM) || 0) + change.pensionAddM
      draft.figures.pensionOwnM = (Number(draft.figures.pensionOwnM) || 0) + change.pensionAddM
      draft.sources.pensionM = 'typed'
      draft.sources.pensionOwnM = 'typed'
    }
    if (change.fullStatePension) {
      draft.figures.sp = 'Expect full'
      draft.sources.sp = 'typed'
      delete draft.figures.spYears
      delete draft.assumptions.spYears
      delete draft.assumptions.spWeek
    }
    normalize(draft, today)
  })
}

/** The largest monthly pension payment that still gets tax relief, and what it costs after relief. */
export function pensionRoom({ figures, rules }: ReportContext) {
  const limitYear = pensionRelief(rules, figures.income, Infinity, figures.age ?? 0)
  const limitM = Math.floor(Math.max(0, limitYear - figures.monthlyOwnPension * 12) / 12)
  const band = figures.married
    ? rules.it.bandMarried + Math.min(figures.partnerIncome, rules.it.bandUplift)
    : figures.singleParentCredit
      ? rules.it.bandSPCCC
      : rules.it.band
  const taxRate = figures.income > band ? 0.4 : 0.2
  return { limitM, taxRate, afterReliefM: Math.round(limitM * (1 - taxRate)) }
}

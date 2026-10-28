// The four answers that block results and the report; everything else has a labelled default.
import type { Plan } from '../../state/types.ts'
import { isChosen } from '../../domain/planning/assumptions.ts'
import { toNumber } from '../../lib/format.ts'

export interface MissingAnswer {
  key: string
  name: string
}

// TODO(R-22): planMissing is not report-only; move to src/domain/plan when the results gate needs it
export function planMissing(plan: Plan): MissingAnswer[] {
  const partnerEarns = !!plan.about.partner && toNumber(plan.fin.pIncome) > 0
  const missing: [boolean, string, string][] = [
    [!plan.retireSet, 'retireAge', 'retirement age'],
    [!isChosen(plan.asm, 'planEnd'), 'planEnd', 'plan-until age'],
    [plan.infl == null, 'infl', 'inflation rate'],
    [partnerEarns && !plan.pRetSet, 'pRetireAge', "partner's retirement age"],
  ]
  return missing.filter(([isMissing]) => isMissing).map(([, key, name]) => ({ key, name }))
}

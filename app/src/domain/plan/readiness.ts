// The four answers that block results and the report; everything else has a labelled default.
import type { Plan } from '../../state/types.ts'
import { isChosen } from '../planning/assumptions.ts'
import { toNumber } from '../../lib/format.ts'

export interface MissingAnswer {
  key: string
  name: string
}

export function planMissing(plan: Plan): MissingAnswer[] {
  const partnerEarns = !!plan.about.partner && toNumber(plan.figures.pIncome) > 0
  const answers = [
    { missing: !plan.retireSet, key: 'retireAge', name: 'retirement age' },
    { missing: !isChosen(plan.assumptions, 'planEnd'), key: 'planEnd', name: 'plan-until age' },
    { missing: plan.inflation == null, key: 'infl', name: 'inflation rate' },
    { missing: partnerEarns && !plan.partnerRetireSet, key: 'pRetireAge', name: "partner's retirement age" },
  ]
  return answers.filter((answer) => answer.missing).map(({ key, name }) => ({ key, name }))
}

// "What your plan assumes": every figure the plan uses, with where it comes from.
import { governmentRules } from '../governmentRules.ts'
import { rules2026, rulesVersion } from '../rates.ts'
import { standardValue } from '../settings.ts'
import { percent } from '../../../lib/format.ts'
import {
  assumptionReader,
  GOVERNMENT,
  MINE,
  NOT_CHOSEN,
  type AssumptionPlan,
  type AssumptionRow,
} from './reader.ts'
import { debtRates, savingAssumptions } from './money.ts'
import { pensionAssumptions } from './pension.ts'

export { ASSUMED, GOVERNMENT, HOW, MINE, type AssumptionRow } from './reader.ts'

const GROWTH = [
  ['Pay rises', 'wage'],
  ['Cash savings grow (after DIRT)', 'cash'],
  ['Investments grow (after charges and exit tax)', 'inv'],
  ['Pensions grow while you work (after charges)', 'pen'],
  ['Pensions grow once retired (after charges)', 'penRet'],
]

/** `ready`: no required choice is missing, so the plan's saving can be shown. */
export function planAssumptions(plan: AssumptionPlan, ready: boolean): AssumptionRow[] {
  const reader = assumptionReader(plan)
  const { rules, startYear } = reader.settings
  const { ie, ieSrc } = rules2026.infl
  const ecb = percent(standardValue('infl') as number)
  const inflation =
    plan.inflation != null
      ? `${percent(plan.inflation)} a year (ECB target ${ecb}; Ireland now ${percent(ie)}, ${ieSrc})`
      : NOT_CHOSEN
  return [
    { label: 'Rules', value: rulesVersion(startYear), tag: GOVERNMENT },
    ...governmentRules(rules, startYear).map(([label, value]) => ({
      label,
      value,
      tag: GOVERNMENT,
    })),
    { label: 'Prices rise (inflation)', value: inflation, tag: MINE },
    ...GROWTH.map(([label, key]) => reader.row(label, `${reader.shown(key)} a year`, key)),
    ...pensionAssumptions(reader),
    ...debtRates(reader),
    ...savingAssumptions(reader, ready),
  ]
}

// "Your assumptions": the customer's choice for an item, else the standard (or the Cautious set's) or a planning fallback.
import { localToday } from '../../lib/today'
import { rulesFor } from './rates'
import { STANDARDS } from './settings.data'
import {
  cautiousValue,
  settingsInUse,
  GROWTH_KEYS,
  standardValue,
  type StandardKey,
} from './settings'

type Amount = number | string | null

export interface AssumptionInputs {
  assumptions: Record<string, Amount | undefined>
  about: { partner: boolean | null }
  figures: { work?: string; income?: Amount; pIncome?: Amount; sp?: string; pSp?: string }
  assumptionSet?: string
}

// a planning figure for when no standard is published, or the item has no standard of its own
const PLANNING_FIGURES: Record<string, [StandardKey | null, number]> = {
  mortRate: ['mortRate', 0.0375],
  cardRate: ['cardRate', 0.2],
  loanRate: ['loanRate', 0.08],
  penChg: ['fundChg', 0.01],
  drawFixed: [null, 20000],
}

export const isGrowthKey = (key: string): key is (typeof GROWTH_KEYS)[number] =>
  (GROWTH_KEYS as readonly string[]).includes(key)

export function chosenAssumption(asm: AssumptionInputs['assumptions'], key: string) {
  const value = asm[key]
  return value == null || value === '' ? null : value
}

export const isChosen = (asm: AssumptionInputs['assumptions'], key: string) =>
  chosenAssumption(asm, key) != null

/** The customer holds shares directly (capital gains tax when sold), not funds or ETFs. */
export const holdsSharesDirectly = ({ assumptions }: Pick<AssumptionInputs, 'assumptions'>) =>
  chosenAssumption(assumptions, 'invWrapper') === 'shares'

// two incomes, both employed: a smaller emergency fund is enough
const twoSecureIncomes = ({ about, figures }: AssumptionInputs) =>
  !!about.partner &&
  Number(figures.income) > 0 &&
  Number(figures.pIncome) > 0 &&
  figures.work === 'Employed'

// a State Pension a week: a share of the full rate, smaller when only partly earned
const weeklyStatePension = (inputs: AssumptionInputs, partly: boolean) =>
  rulesFor(assumption(inputs, 'startYear')).sp.week * (partly ? 0.6 : 0.8)

function fallback(key: string, inputs: AssumptionInputs) {
  const { figures, about } = inputs
  switch (key) {
    case 'startYear':
      // the plan starts this year (2026 at the earliest, the first year with rules)
      return Math.max(2026, localToday().getFullYear())
    case 'ownShare':
      return figures.work === 'Self-employed' ? 1 : standardValue('ownShare')
    case 'safetyMonths':
      return standardValue(twoSecureIncomes(inputs) ? 'safetyMonthsTwo' : 'safetyMonths')
    case 'planEnd':
      return about.partner ? 95 : 90
    case 'spWeek':
      return weeklyStatePension(inputs, figures.sp === 'Partly')
    case 'pSpWeek':
      return weeklyStatePension(inputs, (figures.pSp || 'Not sure') === 'Own partial')
  }
  const rules = rulesFor(assumption(inputs, 'startYear'))
  const direct = holdsSharesDirectly(inputs)
  if (inputs.assumptionSet === 'cautious' && isGrowthKey(key))
    return cautiousValue(key, settingsInUse(), rules, direct)
  const [standard, planningFigure] = PLANNING_FIGURES[key] ?? [key in STANDARDS ? key : null]
  if (!standard && planningFigure == null) throw new Error(`assumption ${key} is not supported yet`)
  const value = standard && standardValue(standard as StandardKey, settingsInUse(), rules, direct)
  return value ?? planningFigure
}

/** The figure in use, as stored: a number, or a choice such as 'spread'. */
export const assumedValue = (inputs: AssumptionInputs, key: string) =>
  (chosenAssumption(inputs.assumptions, key) ?? fallback(key, inputs)) as number | string

export const assumption = (inputs: AssumptionInputs, key: string): number =>
  Number(assumedValue(inputs, key))

// "Your assumptions": the customer's choice for an item, else the standard (or the Cautious set's) or a planning fallback.
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

// from October most of this year has passed, so plans start next year
const START_2027_FROM = new Date('2026-09-30T23:59:59')

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

// two incomes, both employed: a smaller emergency fund is enough
const twoSecureIncomes = ({ about, figures }: AssumptionInputs) =>
  !!about.partner &&
  Number(figures.income) > 0 &&
  Number(figures.pIncome) > 0 &&
  figures.work === 'Employed'

// a State Pension a week: a share of the full rate, smaller when only partly earned
const weeklyStatePension = (inputs: AssumptionInputs, today: Date, partly: boolean) =>
  rulesFor(assumption(inputs, 'startYear', today)).sp.week * (partly ? 0.6 : 0.8)

function fallback(key: string, inputs: AssumptionInputs, today: Date) {
  const { figures, about } = inputs
  switch (key) {
    case 'startYear':
      return today > START_2027_FROM ? 2027 : 2026
    case 'ownShare':
      return figures.work === 'Self-employed' ? 1 : standardValue('ownShare')
    case 'safetyMonths':
      return standardValue(twoSecureIncomes(inputs) ? 'safetyMonthsTwo' : 'safetyMonths')
    case 'planEnd':
      return about.partner ? 95 : 90
    case 'spWeek':
      return weeklyStatePension(inputs, today, figures.sp === 'Partly')
    case 'pSpWeek':
      return weeklyStatePension(inputs, today, (figures.pSp || 'Not sure') === 'Own partial')
  }
  const rules = rulesFor(assumption(inputs, 'startYear', today))
  if (inputs.assumptionSet === 'cautious' && isGrowthKey(key))
    return cautiousValue(key, settingsInUse(), rules)
  const [standard, planningFigure] = PLANNING_FIGURES[key] ?? [key in STANDARDS ? key : null]
  if (!standard && planningFigure == null) throw new Error(`assumption ${key} is not supported yet`)
  const value = standard && standardValue(standard as StandardKey, settingsInUse(), rules)
  return value ?? planningFigure
}

/** The figure in use, as stored: a number, or a choice such as 'spread'. */
export const assumedValue = (inputs: AssumptionInputs, key: string, today = new Date()) =>
  (chosenAssumption(inputs.assumptions, key) ?? fallback(key, inputs, today)) as number | string

export const assumption = (inputs: AssumptionInputs, key: string, today = new Date()): number =>
  Number(assumedValue(inputs, key, today))

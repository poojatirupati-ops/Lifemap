// "Your assumptions": the customer's choice for an item, else the standard or a planning fallback.
import { rulesFor } from './rates'
import { standardValue, type StandardKey } from './settings'

type Amount = number | string | null

export interface AssumptionInputs {
  assumptions: Record<string, Amount | undefined>
  about: { partner: boolean | null }
  figures: { work?: string; income?: Amount; pIncome?: Amount; sp?: string; pSp?: string }
}

// from October most of this year has passed, so plans start next year
const START_2027_FROM = new Date('2026-09-30T23:59:59')

// items that follow a standard, with a market rate for when no standard is published
const FROM_STANDARD: Record<string, [StandardKey, number?]> = {
  wage: ['wage'],
  cash: ['cash'],
  inv: ['inv'],
  pen: ['pen'],
  penRet: ['penRet'],
  mortRate: ['mortRate', 0.0375],
  cardRate: ['cardRate', 0.2],
  loanRate: ['loanRate', 0.08],
  penChg: ['fundChg', 0.01],
}

export function chosenAssumption(asm: AssumptionInputs['assumptions'], key: string) {
  const value = asm[key]
  return value == null || value === '' ? null : value
}

export const isChosen = (asm: AssumptionInputs['assumptions'], key: string) =>
  chosenAssumption(asm, key) != null

// two incomes, both employed: a smaller emergency fund is enough
const twoSecureIncomes = ({ about, figures: fin }: AssumptionInputs) =>
  !!about.partner && Number(fin.income) > 0 && Number(fin.pIncome) > 0 && fin.work === 'Employed'

// a State Pension a week: a share of the full rate, smaller when only partly earned
const weeklyStatePension = (inputs: AssumptionInputs, today: Date, partly: boolean) =>
  rulesFor(assumption(inputs, 'startYear', today)).sp.week * (partly ? 0.6 : 0.8)

function fallback(key: string, inputs: AssumptionInputs, today: Date) {
  const { figures: fin, about } = inputs
  switch (key) {
    case 'startYear':
      return today > START_2027_FROM ? 2027 : 2026
    case 'ownShare':
      return fin.work === 'Self-employed' ? 1 : standardValue('ownShare')
    case 'safetyMonths':
      return standardValue(twoSecureIncomes(inputs) ? 'safetyMonthsTwo' : 'safetyMonths')
    case 'planEnd':
      return about.partner ? 95 : 90
    case 'spWeek':
      return weeklyStatePension(inputs, today, fin.sp === 'Partly')
    case 'pSpWeek':
      return weeklyStatePension(inputs, today, (fin.pSp || 'Not sure') === 'Own partial')
  }
  if (!(key in FROM_STANDARD)) throw new Error(`assumption ${key} is not supported yet`)
  const [standard, marketRate] = FROM_STANDARD[key]
  return standardValue(standard) ?? marketRate
}

export const assumption = (inputs: AssumptionInputs, key: string, today = new Date()): number =>
  Number(chosenAssumption(inputs.assumptions, key) ?? fallback(key, inputs, today))

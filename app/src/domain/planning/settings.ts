// The standards the app suggests: LifeMap's own, or a partner's figure where one is set.
import { percentToTenth, wholePercent } from '../../lib/format'
import { rules2026, type Rules } from './rates'
import {
  DEFAULT_FUND_CHARGES,
  GUIDANCE_FIGURES,
  STANDARDS,
  type Standard,
  type StandardKey,
} from './settings.data'

export type { StandardKey }

export type Settings = {
  partner: string
  standards: Record<StandardKey, Standard>
  guidance: Record<string, Standard>
}

export const defaultSettings: Settings = {
  partner: '',
  standards: structuredClone(STANDARDS),
  guidance: structuredClone(GUIDANCE_FIGURES),
}

const inUse = (standard?: Standard) => standard?.partnerValue ?? standard?.value

// growth before fees and fund charges are plain rates
const rateInUse = (settings: Settings, key: 'invGross' | 'fundChg') =>
  inUse(settings.standards[key]) as number | undefined

const fundCharges = (settings: Settings) => rateInUse(settings, 'fundChg') ?? DEFAULT_FUND_CHARGES

// Growth after charges and after exit tax taken every 8 years (deemed disposal), as a yearly rate to 0.1%
export function investmentGrowth(settings = defaultSettings, cut = 0, rules: Rules = rules2026) {
  const gross = rateInUse(settings, 'invGross')! - cut
  const { deemed: years, exit: tax } = rules.sav
  const grown = (1 + gross - fundCharges(settings)) ** years
  const afterTax = grown - tax * (grown - 1)
  return Math.round((afterTax ** (1 / years) - 1) * 1000) / 1000
}

export function investmentGrowthBasis(settings = defaultSettings, rules: Rules = rules2026) {
  const gross = percentToTenth(rateInUse(settings, 'invGross')!)
  const charges = percentToTenth(fundCharges(settings))
  const { deemed, exit } = rules.sav
  const lessCharges = `less about ${charges} charges`
  const lessTax = `less ${wholePercent(exit)} exit tax taken every ${deemed} years`
  return `a planning assumption, not a prediction: ${gross} before fees and tax, ${lessCharges}, ${lessTax}`
}

// 'inv' has no figure of its own: it is derived from the growth before fees and the charges
export function standardOf(key: StandardKey, settings: Settings, rules = rules2026): Standard {
  const standard = settings.standards[key]
  if (key !== 'inv' || standard.unit === 'pct3') return standard
  return {
    ...standard,
    value: investmentGrowth(settings, 0, rules),
    cautious: investmentGrowth(settings, 0.01, rules),
    by: investmentGrowthBasis(settings, rules),
  }
}

export const standardValue = (key: StandardKey, settings = defaultSettings) =>
  inUse(standardOf(key, settings))

export const cautiousValue = (key: StandardKey, settings = defaultSettings) =>
  standardOf(key, settings).cautious

const isPartnerFigure = (key: StandardKey, settings = defaultSettings) =>
  settings.standards[key]?.partnerValue != null

const partnerCredit = (settings: Settings) => `Suggested by ${settings.partner || 'your provider'}`

// shown as "Generally the standard is X (source)"
export function standardSource(key: StandardKey, settings = defaultSettings) {
  if (!settings.standards[key]) return ''
  return isPartnerFigure(key, settings) ? partnerCredit(settings) : standardOf(key, settings).by
}

// the suffix on a market-rate chip
export function standardLabel(key: StandardKey, settings = defaultSettings) {
  if (!settings.standards[key]) return ''
  if (isPartnerFigure(key, settings)) return partnerCredit(settings)
  const standard = standardOf(key, settings)
  return standard.label || standard.by
}

// keys whose guidance wording lives on a shared standard (riskMu1-3 and riskVol1-3 drop the digit)
const GUIDANCE_FROM: Record<string, StandardKey> = {
  budgetNeeds: 'budget',
  budgetWants: 'budget',
  budgetSave: 'budget',
  penChg: 'fundChg',
  depEarn: 'depRate',
}

const guidanceKey = (key: string) =>
  GUIDANCE_FROM[key] ?? (key.replace(/^(risk(Mu|Vol))\d$/, '$1') as StandardKey)

export const guidance = (key: string, settings = defaultSettings) =>
  settings.standards[guidanceKey(key)]?.guide || ''

/** The growth rates the Standard / Cautious switch sets. */
export const GROWTH_KEYS = ['wage', 'cash', 'inv', 'pen', 'penRet'] as const

/** A growth rate under the standard or the cautious set; each is a plain rate in both. */
export function growthRate(
  key: (typeof GROWTH_KEYS)[number],
  set: 'standard' | 'cautious',
  settings = defaultSettings,
) {
  const standard = standardOf(key, settings)
  return Number(set === 'cautious' ? standard.cautious : inUse(standard))
}

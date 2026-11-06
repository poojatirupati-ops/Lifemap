// The standards the app suggests: LifeMap's own, or a partner's figure where one is set.
import { createStore } from 'zustand'
import { percentToTenth, wholePercent } from '../../lib/format'
import { rules2026, type Rules } from './rates'
import {
  DEFAULT_FUND_CHARGES,
  GUIDANCE_FIGURES,
  STANDARDS,
  type Standard,
  type StandardKey,
  type StandardValue,
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

/** A tenant's own figures, by standard key (the tenant config's `rates`). */
export type PartnerFigures = Partial<Record<string, StandardValue>>

/** LifeMap's standards with a partner's own figures over them. */
export function withPartnerFigures(partner: string, partnerFigures: PartnerFigures = {}): Settings {
  const settings = structuredClone(defaultSettings)
  settings.partner = partner
  for (const [key, figure] of Object.entries(partnerFigures)) {
    const standard = settings.standards[key as StandardKey]
    if (standard && figure != null) Object.assign(standard, { partnerValue: figure })
  }
  return settings
}

/** The standards in use and the tenant figures they came from (key '' for LifeMap's own). */
export const figures = createStore(() => ({ settings: defaultSettings, key: '' }))

/** The standards the planning maths uses: LifeMap's, with the active tenant's figures over them (a new object once they change). */
export const settingsInUse = () => figures.getState().settings

/** Use the active tenant's figures from now on. */
export function applyTenantFigures(partner: string, partnerFigures: PartnerFigures = {}) {
  // the partner's name shows only beside its figures
  const key = Object.keys(partnerFigures).length ? JSON.stringify([partner, partnerFigures]) : ''
  if (key !== figures.getState().key)
    figures.setState({ settings: withPartnerFigures(partner, partnerFigures), key })
}

const inUse = (standard?: Standard) => standard?.partnerValue ?? standard?.value

// growth before fees and fund charges are plain rates
const rateInUse = (settings: Settings, key: 'invGross' | 'fundChg') =>
  inUse(settings.standards[key]) as number | undefined

const fundCharges = (settings: Settings) => rateInUse(settings, 'fundChg') ?? DEFAULT_FUND_CHARGES

const toTenthPercent = (rate: number) => Math.round(rate * 1000) / 1000

/** Growth after charges, before any tax, as a yearly rate to 0.1%. */
export const growthAfterCharges = (settings = settingsInUse(), cut = 0) =>
  toTenthPercent(rateInUse(settings, 'invGross')! - cut - fundCharges(settings))

/**
 * Growth after charges and, for funds and ETFs, after exit tax taken every 8 years (deemed
 * disposal), as a yearly rate to 0.1%. Shares held directly pay capital gains tax only when sold.
 */
export function investmentGrowth(
  settings = settingsInUse(),
  cut = 0,
  rules: Rules = rules2026,
  direct = false,
) {
  if (direct) return growthAfterCharges(settings, cut)
  const gross = rateInUse(settings, 'invGross')! - cut
  const { deemed: years, exit: tax } = rules.sav
  const grown = (1 + gross - fundCharges(settings)) ** years
  const afterTax = grown - tax * (grown - 1)
  return toTenthPercent(afterTax ** (1 / years) - 1)
}

export function investmentGrowthBasis(
  settings = settingsInUse(),
  rules: Rules = rules2026,
  direct = false,
) {
  if (direct)
    return 'a planning assumption, not a prediction: growth before fees less about 1% charges; capital gains tax is taken off when the shares are sold, not each year'
  const gross = percentToTenth(rateInUse(settings, 'invGross')!)
  const charges = percentToTenth(fundCharges(settings))
  const { deemed, exit } = rules.sav
  const lessCharges = `less about ${charges} charges`
  const lessTax = `less ${wholePercent(exit)} exit tax taken every ${deemed} years`
  return `a planning assumption, not a prediction: ${gross} before fees and tax, ${lessCharges}, ${lessTax}`
}

// 'inv' has no figure of its own: it is derived from the growth before fees and the charges.
// rules: the plan's start-year rules ('inv' takes its exit tax and deemed-disposal years from them);
// direct: the plan's investments are shares held directly (no exit tax)
export function standardOf(
  key: StandardKey,
  settings: Settings,
  rules = rules2026,
  direct = false,
): Standard {
  const standard = settings.standards[key]
  if (key !== 'inv' || standard.unit === 'pct3') return standard
  return {
    ...standard,
    value: investmentGrowth(settings, 0, rules, direct),
    cautious: investmentGrowth(settings, 0.01, rules, direct),
    by: investmentGrowthBasis(settings, rules, direct),
  }
}

export const standardValue = (
  key: StandardKey,
  settings = settingsInUse(),
  rules = rules2026,
  direct = false,
) => inUse(standardOf(key, settings, rules, direct))

export const cautiousValue = (
  key: StandardKey,
  settings = settingsInUse(),
  rules = rules2026,
  direct = false,
) => standardOf(key, settings, rules, direct).cautious

const isPartnerFigure = (key: StandardKey, settings = settingsInUse()) =>
  settings.standards[key]?.partnerValue != null

const partnerCredit = (settings: Settings) => `Suggested by ${settings.partner || 'your provider'}`

// shown as "Generally the standard is X (source)"
export function standardSource(
  key: StandardKey,
  settings = settingsInUse(),
  rules = rules2026,
  direct = false,
) {
  if (!settings.standards[key]) return ''
  return isPartnerFigure(key, settings)
    ? partnerCredit(settings)
    : standardOf(key, settings, rules, direct).by
}

// the suffix on a market-rate chip
export function standardLabel(key: StandardKey, settings = settingsInUse()) {
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

export const guidance = (key: string, settings = settingsInUse()) =>
  settings.standards[guidanceKey(key)]?.guide || ''

/** The growth rates the Standard / Cautious switch sets. */
export const GROWTH_KEYS = ['wage', 'cash', 'inv', 'pen', 'penRet'] as const

/** A growth rate under the standard or the cautious set; each is a plain rate in both. */
export function growthRate(
  key: (typeof GROWTH_KEYS)[number],
  set: 'standard' | 'cautious',
  settings = settingsInUse(),
  rules = rules2026,
  direct = false,
) {
  const standard = standardOf(key, settings, rules, direct)
  return Number(set === 'cautious' ? standard.cautious : inUse(standard))
}

// A partner's own figure for a LifeMap standard: how it reads, what is allowed and how a typed entry is taken.
import { euro, percent } from '../../lib/format.ts'
import type { Rules } from '../../domain/planning/rates.ts'
import type { Settings, StandardKey } from '../../domain/planning/settings.ts'
import type { Standard, StandardValue } from '../../domain/planning/settings.data.ts'
import { ASSUMPTIONS } from '../me/assumptionFields.data.ts'
import { investmentStandard } from './investmentStandard.ts'

type Option = [value: string | number, label: string]

/** Sane limits for a partner's figure, in the figure's own units (0.03 = 3%). */
const LIMITS: Partial<Record<StandardKey, [number, number]>> = {
  infl: [0, 0.06],
  wage: [0, 0.06],
  cash: [0, 0.04],
  inv: [0, 0.06],
  invGross: [0, 0.08],
  pen: [0, 0.07],
  penRet: [0, 0.06],
  rentRise: [0, 0.08],
  houseGrow: [0, 0.06],
  upkeep: [0, 0.03],
  ownShare: [0, 1],
  retireMult: [15, 40],
  retireSpend: [0.4, 1],
  lumpSum: [0, 0.25],
  safetyMonths: [1, 12],
  safetyMonthsTwo: [1, 12],
  cashYears: [1, 10],
  investShare: [0, 1],
  cgtGain: [0, 1],
  saveShare: [0, 1],
  noAnswer: [0, 5000],
  lifeShare: [0.3, 1],
  lifeYears: [1, 30],
  mortRate: [0.005, 0.1],
  loanRate: [0, 0.3],
  cardRate: [0, 0.35],
  depRate: [0, 0.06],
  buyFees: [0, 50000],
  fundChg: [0, 0.05],
  waitYears: [0, 20],
  style: [1, 3],
}

/** The standard as shown: 'inv' is derived from the growth before fees and the charges. */
export const shownStandard = (key: StandardKey, settings: Settings, rules: Rules): Standard =>
  key === 'inv' ? investmentStandard(settings, rules) : settings.standards[key]

/** The answers a choice standard can take, from the matching assumption. */
export const choicesFor = (key: StandardKey): Option[] => ASSUMPTIONS[key]?.options ?? []

const plainPercent = (fraction: number, digits: number) => Number((fraction * 100).toFixed(digits))

export function formatFigure(key: StandardKey, unit: string, value?: StandardValue) {
  if (value == null) return 'none'
  if (Array.isArray(value)) return value.map(percent).join(' / ')
  if (unit === 'pct') return percent(Number(value))
  if (unit === 'eur') return euro(Number(value))
  if (unit === 'yrs') return `${value} ${value === 1 ? 'year' : 'years'}`
  if (unit === 'choice') {
    const option = choicesFor(key).find(([choice]) => String(choice) === String(value))
    return option ? option[1] : String(value)
  }
  return String(value)
}

export function limitsText(key: StandardKey, unit: string) {
  const limits = LIMITS[key]
  if (!limits) return ''
  const show = (x: number) =>
    unit === 'pct' ? `${plainPercent(x, 2)}%` : unit === 'eur' ? euro(x) : String(x)
  const legal = key === 'lumpSum' ? ' (25% is the legal limit)' : ''
  return `Allowed: ${show(limits[0])} to ${show(limits[1])}${legal}`
}

/** What a single-figure input shows: the partner's figure, else blank over the standard. */
export function inputText(standard: Standard, figure?: StandardValue) {
  if (figure == null) return ''
  return standard.unit === 'pct' ? String(plainPercent(Number(figure), 3)) : String(figure)
}

export function placeholderText(standard: Standard) {
  if (standard.value == null) return 'none'
  return standard.unit === 'pct'
    ? String(plainPercent(Number(standard.value), 3))
    : String(standard.value)
}

export const listItemText = (figure: number) => String(plainPercent(figure, 2))

export type Entry = { figure: StandardValue | null } | { refused: string }

/** Read a typed or picked partner figure; blank means back to the LifeMap standard. */
export function readEntry(key: StandardKey, standard: Standard, raw: string, item = 0): Entry {
  const text = raw.trim()
  if (standard.unit === 'choice') {
    if (text === '') return { figure: null }
    return { figure: typeof standard.value === 'number' ? Number(text) : text }
  }

  if (standard.unit === 'pct3') {
    const base = standard.value as number[]
    const list = [...((standard.partnerValue ?? base) as number[])]
    const typed = parseFloat(text)
    list[item] = text === '' || Number.isNaN(typed) ? base[item] : Math.max(0, typed) / 100
    const unchanged = list.every((x, i) => Math.abs(x - base[i]) < 1e-9)
    return { figure: unchanged ? null : list }
  }

  const typed = parseFloat(text.replace(/,/g, ''))
  if (text === '' || Number.isNaN(typed)) return { figure: null }
  const figure = standard.unit === 'pct' ? typed / 100 : typed
  const limits = LIMITS[key]
  if (limits && (figure < limits[0] - 1e-9 || figure > limits[1] + 1e-9)) {
    const allowed = limitsText(key, standard.unit)
    return { refused: `That figure is outside the allowed range, so it was not used. ${allowed}.` }
  }
  return { figure: Math.max(0, figure) }
}

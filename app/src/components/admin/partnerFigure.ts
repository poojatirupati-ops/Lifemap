// How a standard and a partner's figure read on the admin view.
import { euro, percent } from '../../lib/format.ts'
import { ASSUMPTIONS } from '../../domain/planning/assumptionFields.data.ts'
import { LIMITS } from '../../domain/planning/partnerFigure.ts'
import type { Standard, StandardKey, StandardValue } from '../../domain/planning/settings.data.ts'

type Option = [value: string | number, label: string]
type Unit = Standard['unit']

/** The answers a choice standard can take, from the matching assumption. */
export const choicesFor = (key: StandardKey): Option[] => ASSUMPTIONS[key]?.options ?? []

/** The option a choice standard's figure (or a select's value) stands for. */
export const choiceFor = (key: StandardKey, value: string) =>
  choicesFor(key).find(([choice]) => String(choice) === value)

const plainPercent = (fraction: number, digits: number) => Number((fraction * 100).toFixed(digits))

export function formatFigure(key: StandardKey, unit: Unit, value?: StandardValue) {
  if (value == null) return 'none'
  if (Array.isArray(value)) return value.map(percent).join(' / ')
  if (unit === 'pct') return percent(Number(value))
  if (unit === 'eur') return euro(Number(value))
  if (unit === 'yrs') return `${value} ${value === 1 ? 'year' : 'years'}`
  if (unit === 'choice') return choiceFor(key, String(value))?.[1] ?? String(value)
  return String(value)
}

export function limitsText(key: StandardKey, unit: Unit) {
  const limits = LIMITS[key]
  if (!limits) return ''
  const show = (x: number) => {
    if (unit === 'pct') return `${plainPercent(x, 2)}%`
    if (unit === 'eur') return euro(x)
    return String(x)
  }
  const legal = key === 'lumpSum' ? ' (25% is the legal limit)' : ''
  return `Allowed: ${show(limits[0])} to ${show(limits[1])}${legal}`
}

/** Why a typed figure was not used, with the allowed range when there is one. */
export function refusedText(key: StandardKey, unit: Unit, why: 'notNumber' | 'outOfRange') {
  if (why === 'notNumber') return 'That is not a number, so it was not used.'
  const limits = limitsText(key, unit)
  return `That figure is outside the allowed range, so it was not used.${limits ? ` ${limits}.` : ''}`
}

/** What a single-figure input shows: the figure, a percent as a plain number. */
export function inputText(standard: Standard, figure?: StandardValue) {
  if (figure == null) return ''
  return standard.unit === 'pct' ? String(plainPercent(Number(figure), 3)) : String(figure)
}

export const listItemText = (figure: number) => String(plainPercent(figure, 2))

// What Your assumptions shows for each field: the figure in use, its tag and the words under it.
import { euro, euroWeekly, percent } from '../../lib/format.ts'
import { assumption, chosenAssumption } from '../../domain/planning/assumptions.ts'
import { rules2026, rulesFor } from '../../domain/planning/rates.ts'
import { STANDARDS } from '../../domain/planning/settings.data.ts'
import {
  cautiousValue,
  guidance,
  standardLabel,
  standardSource,
  standardValue,
  type StandardKey,
} from '../../domain/planning/settings.ts'
import type { Plan } from '../../state/types.ts'
import { ASSUMPTIONS, type AssumptionField } from './assumptionFields.data.ts'

type Amount = number | string
export type AssumptionPlan = Pick<Plan, 'asm' | 'about' | 'fin' | 'assume'>

const GROWTH_SET = ['wage', 'cash', 'inv', 'pen', 'penRet']
// standards whose figure depends on the household or the date
const FROM_HOUSEHOLD = ['safetyMonths', 'ownShare', 'startYear']

export const isMine = (plan: AssumptionPlan, key: string) => chosenAssumption(plan.asm, key) != null

const isStandard = (key: string) => !!ASSUMPTIONS[key].standard || key === 'startYear'

/** LifeMap's standard for a field, before the customer changes it. */
export function standardFor(plan: AssumptionPlan, key: string): Amount | null {
  if (FROM_HOUSEHOLD.includes(key)) return assumption({ ...plan, asm: {} }, key)
  const { standard, item } = ASSUMPTIONS[key]
  if (!standard) return null
  const value = standardValue(standard)
  return (item == null ? value : (value as number[])[item]) as Amount
}

/** A market rate's published suggestion, in the field's own units; null when none is published. */
export function marketSuggestion({ market, afterDirt, kind }: AssumptionField) {
  const published = market && (standardValue(market) as number | null | undefined)
  if (published == null) return null
  const value = afterDirt ? +(published * (1 - rules2026.sav.dirt)).toFixed(4) : published
  const shown = (kind === 'eur' ? euro(value) : percent(value)) + (afterDirt ? ' after DIRT' : '')
  return { value, shown, source: standardLabel(market!) }
}

/** The figure the plan uses: the customer's, else the growth set's, the standard, the suggestion or a planning figure. */
export function valueInUse(plan: AssumptionPlan, key: string): Amount | null {
  const field = ASSUMPTIONS[key]
  const mine = chosenAssumption(plan.asm, key)
  if (mine != null) return mine
  if (plan.assume === 'cautious' && GROWTH_SET.includes(key))
    return cautiousValue(key as StandardKey) ?? null
  if (isStandard(key)) return standardFor(plan, key)
  if (key === 'spWeek' || key === 'pSpWeek') return assumption(plan, key)
  return marketSuggestion(field)?.value ?? field.fallback ?? null
}

/** A value as words: 2.5%, €250, €299.30 a week, 3 years, 25× (about 4% a year), Rise with prices. */
export function formatAssumption(key: string, value: Amount | null) {
  const field = ASSUMPTIONS[key]
  if (value == null) return 'Not chosen yet'
  const n = Number(value)
  switch (field.kind) {
    case 'pct':
      return percent(n)
    case 'eur':
      return euro(n)
    case 'eurw':
      return `${euroWeekly(n)} a week`
    case 'yrs':
      return `${value} ${n === 1 ? 'year' : 'years'}`
    case 'age':
      return `age ${value}`
    case 'num':
      if (key === 'retireMult') return `${value}× (about ${+(100 / n).toFixed(1)}% a year)`
      if (key === 'safetyMonths') return `${value} ${n === 1 ? 'month' : 'months'}`
      return String(value)
    case 'choice':
      return (
        field.options!.find(([option]) => String(option) === String(value))?.[1] ?? String(value)
      )
  }
}

/** The tag after the label: Your choice, Set by LifeMap, Optional or Assumed: add yours. */
export function tagFor(plan: AssumptionPlan, key: string) {
  const field = ASSUMPTIONS[key]
  if (isMine(plan, key)) return { className: 'tag doc', text: 'Your choice' }
  if (isStandard(key)) return { className: 'tag pre', text: 'Set by LifeMap' }
  if (field.optional && !marketSuggestion(field))
    return { className: 'tag typed', text: 'Optional' }
  return { className: 'tag look', text: 'Assumed: add yours' }
}

const bySource = (key: string) => ASSUMPTIONS[key].by ?? standardSource(ASSUMPTIONS[key].standard!)

function guide(plan: AssumptionPlan, key: string) {
  const field = ASSUMPTIONS[key]
  if (field.market)
    return field.optional && !marketSuggestion(field)
      ? `Optional: no published figure, so no suggestion. Leave it blank to count ${field.kind === 'eur' ? '€0' : '0%'}.`
      : ''
  if (field.range) {
    const rules = rulesFor(assumption(plan, 'startYear'))
    const [low, high] = field.range(rules).map((end) => formatAssumption(key, end))
    return `Usually between ${low} and ${high} (${field.by}).`
  }
  if (!isStandard(key)) return ''
  return `LifeMap uses ${formatAssumption(key, standardFor(plan, key))} (${bySource(key)}). Change it if you want to use your own.`
}

function helpFor(key: string) {
  const field = ASSUMPTIONS[key]
  if (field.help != null) return field.help
  if (key === 'penChg') return `${guidance(key)} ${STANDARDS.fundChg.note}.`
  if (key !== 'cash') return guidance(key)
  const deposits = standardValue('depRate') as number | null
  if (deposits == null) return 'Demand accounts pay less than fixed-term deposits.'
  const source = (standardLabel('depRate') ?? '').replace(
    /: average rate on new fixed-term household deposits/,
    '',
  )
  return `New fixed-term household deposits averaged ${percent(deposits)} before 33% DIRT (${source}). Demand accounts pay less.`
}

/** The small print under a field: how LifeMap sets it, then its help. */
export const smallPrint = (plan: AssumptionPlan, key: string) =>
  [guide(plan, key), helpFor(key)].filter(Boolean).join(' ')

const host = (source: string) =>
  /^https?:\/\//.test(source) ? source.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] : source

/** Where a LifeMap standard comes from: "… . Source: centralbank.ie (Jun 2026)." */
export function standardNote(key: string) {
  const standard = ASSUMPTIONS[key].standard
  const settings = standard && STANDARDS[standard]
  if (!settings) return ''
  const asOf = settings.asOf ? ` (${settings.asOf})` : ''
  return `${standardSource(standard)}. Source: ${host(settings.source)}${asOf}.`
}

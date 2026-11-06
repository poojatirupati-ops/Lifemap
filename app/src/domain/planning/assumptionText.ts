// What Your assumptions shows for each field: the figure in use, its tag and the words under it.
import { euro, euroWeekly, percent } from '../../lib/format.ts'
import type { Plan } from '../../state/types.ts'
import { assumption, chosenAssumption, holdsSharesDirectly, isGrowthKey } from './assumptions.ts'
import { ASSUMPTIONS, type AssumptionField, type NumberKind } from './assumptionFields.data.ts'
import { rules2026, rulesFor, type Rules } from './rates.ts'
import { STANDARDS } from './settings.data.ts'
import {
  settingsInUse,
  guidance,
  standardLabel,
  standardSource,
  standardValue,
} from './settings.ts'

type Amount = number | string
export type AssumptionPlan = Pick<Plan, 'assumptions' | 'about' | 'figures' | 'assumptionSet'>

export const isMine = (plan: AssumptionPlan, key: string) =>
  chosenAssumption(plan.assumptions, key) != null

const isStandard = ({ standard, fromPlan }: AssumptionField) => !!standard || !!fromPlan

/** The rules of the plan's start year, which the derived standards (investment growth) follow. */
export const planRules = (plan: AssumptionPlan) => rulesFor(assumption(plan, 'startYear'))

/** LifeMap's standard for a field, before the customer changes it. */
export function standardFor(plan: AssumptionPlan, key: string): Amount | null {
  const { standard, item, fromPlan } = ASSUMPTIONS[key]
  if (fromPlan) return assumption({ ...plan, assumptions: {} }, key)
  if (!standard) return null
  const value = standardValue(standard, settingsInUse(), planRules(plan), holdsSharesDirectly(plan))
  return (item == null ? value : (value as number[])[item]) as Amount
}

/** A market rate's published suggestion, in the field's own units; null when none is published. */
export function marketSuggestion({
  market,
  afterDirt,
  kind,
}: Pick<AssumptionField, 'market' | 'afterDirt' | 'kind'>) {
  if (!market) return null
  const published = standardValue(market) as number | null | undefined
  if (published == null) return null
  const value = afterDirt ? +(published * (1 - rules2026.sav.dirt)).toFixed(4) : published
  const shown = (kind === 'eur' ? euro(value) : percent(value)) + (afterDirt ? ' after DIRT' : '')
  return { value, shown, source: standardLabel(market) }
}

/** The figure the plan uses: the customer's, else the growth set's, the standard, the suggestion or a planning figure. */
export function valueInUse(plan: AssumptionPlan, key: string): Amount | null {
  const field = ASSUMPTIONS[key]
  const mine = chosenAssumption(plan.assumptions, key)
  if (mine != null) return mine
  if (plan.assumptionSet === 'cautious' && isGrowthKey(key)) return assumption(plan, key)
  if (isStandard(field)) return standardFor(plan, key)
  if (field.workedOut) return assumption(plan, key)
  return marketSuggestion(field)?.value ?? field.fallback ?? null
}

const plural = (n: number, word: string) => `${n} ${n === 1 ? word : `${word}s`}`

const FORMAT: Record<NumberKind, (n: number) => string> = {
  pct: percent,
  eur: euro,
  eurw: (n) => `${euroWeekly(n)} a week`,
  yrs: (n) => plural(n, 'year'),
  months: (n) => plural(n, 'month'),
  times: (n) => `${n}× (about ${+(100 / n).toFixed(1)}% a year)`,
  age: (n) => `age ${n}`,
}

/** A value as words: 2.5%, €250, €299.30 a week, 3 years, 25× (about 4% a year), Rise with prices. */
export function formatAssumption(key: string, value: Amount | null) {
  const field = ASSUMPTIONS[key]
  if (value == null) return 'Not chosen yet'
  if (field.kind !== 'choice') return FORMAT[field.kind](Number(value))
  return field.options.find(([option]) => String(option) === String(value))?.[1] ?? String(value)
}

/** A stored figure as the customer types it: percentages are kept as 0.025 and typed as 2.5. */
export const typedFigure = (field: AssumptionField, value: number) =>
  field.kind === 'pct' ? +(value * 100).toFixed(2) : value

/** A typed figure as it is stored; whole-step fields are rounded. */
export function storedFigure(field: AssumptionField, typed: number) {
  if (field.kind === 'pct') return +(typed / 100).toFixed(6)
  return (field.step ?? 1) % 1 === 0 ? Math.round(typed) : typed
}

export const TAGS = {
  mine: { className: 'tag doc', text: 'Your choice' },
  standard: { className: 'tag pre', text: 'Set by LifeMap' },
  optional: { className: 'tag typed', text: 'Optional' },
  assumed: { className: 'tag look', text: 'Assumed: add yours' },
} as const

/** The tag after the label: Your choice, Set by LifeMap, Optional or Assumed: add yours. */
export function tagFor(plan: AssumptionPlan, key: string): keyof typeof TAGS {
  const field = ASSUMPTIONS[key]
  if (isMine(plan, key)) return 'mine'
  if (isStandard(field)) return 'standard'
  if (field.optional && !marketSuggestion(field)) return 'optional'
  return 'assumed'
}

const bySource = (field: AssumptionField, plan: AssumptionPlan) =>
  field.by ??
  standardSource(field.standard!, settingsInUse(), planRules(plan), holdsSharesDirectly(plan))

function guide(plan: AssumptionPlan, key: string) {
  const field = ASSUMPTIONS[key]
  if (field.market) {
    if (!field.optional || marketSuggestion(field)) return ''
    const blank = field.kind === 'eur' ? '€0' : '0%'
    return `Optional: no published figure, so no suggestion. Leave it blank to count ${blank}.`
  }
  if (field.range) {
    const [low, high] = field.range(planRules(plan)).map((end) => formatAssumption(key, end))
    return `Usually between ${low} and ${high} (${field.by}).`
  }
  if (!isStandard(field)) return ''
  const figure = formatAssumption(key, standardFor(plan, key))
  return `LifeMap uses ${figure} (${bySource(field, plan)}). Change it if you want to use your own.`
}

function helpFor(key: string) {
  const { help } = ASSUMPTIONS[key]
  if (help == null) return guidance(key)
  return typeof help === 'string' ? help : help()
}

/** The small print under a field: how LifeMap sets it, then its help. */
export const smallPrint = (plan: AssumptionPlan, key: string) =>
  [guide(plan, key), helpFor(key)].filter(Boolean).join(' ')

const WEB_PREFIX = /^https?:\/\/(www\.)?/

const host = (source: string) =>
  WEB_PREFIX.test(source) ? source.replace(WEB_PREFIX, '').split('/')[0] : source

/** Where a LifeMap standard comes from: "… . Source: centralbank.ie (Jun 2026)." */
export function standardNote(key: string, rules: Rules, direct = false) {
  const standard = ASSUMPTIONS[key].standard
  const settings = standard && STANDARDS[standard]
  if (!settings) return ''
  const asOf = settings.asOf ? ` (${settings.asOf})` : ''
  return `${standardSource(standard, settingsInUse(), rules, direct)}. Source: ${host(settings.source)}${asOf}.`
}

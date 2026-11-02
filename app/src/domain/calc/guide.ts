// The words around an assumption input in a tool: its one-tap standard, the guidance under it, its tag.
import { chosenAssumption } from '../planning/assumptions.ts'
import { guideSource, type Rules } from '../planning/rates.ts'
import {
  defaultSettings,
  guidance,
  standardSource,
  standardValue,
  type StandardKey,
} from '../planning/settings.ts'
import { STANDARDS } from '../planning/settings.data.ts'
import { euro, euroWeekly, percent } from '../../lib/format.ts'
import type { AssumptionField } from '../planning/assumptionFields.data.ts'
import {
  formatAssumption,
  marketSuggestion,
  standardFor,
  type AssumptionPlan,
} from '../planning/assumptionText.ts'
import { fieldOf, kindOf } from './assumptions.data.ts'
import type { Binding } from './bindings.data.ts'
import { bindingOf } from './calculators.ts'
import type { ToolPlan } from './context.ts'
import { inToolUnits, isStandardBinding } from './values.ts'
import { STYLE_CHOICES } from './choices.ts'
import { years } from './words.ts'

const retireHelp = ({ pen, guide, sp }: Rules) =>
  `You can usually draw a pension from ${pen.earliestAge} (${guideSource('schemeEarliest')} from ${guide.schemeEarliest}); State Pension is paid from ${sp.age}.`

/** "Use the suggested rate (3.48%) · Central Bank average …" */
function suggestionChip(market: StandardKey, kind: AssumptionField['kind'], afterDirt = false) {
  const suggestion = marketSuggestion({ market, kind, afterDirt })
  if (!suggestion) return null
  const published = standardValue(market) as number
  const beforeDirt =
    afterDirt && defaultSettings.standards[market].partnerValue == null
      ? ` (${percent(published)} before DIRT)`
      : ''
  const what = suggestion.shown.startsWith('€') ? 'figure' : 'rate'
  return {
    value: suggestion.value,
    text: `Use the suggested ${what} (${suggestion.shown}) · ${suggestion.source}${beforeDirt}`,
  }
}

type LocalFormat = Extract<Binding, { format: string }>['format']

const LOCAL_FORMATS: Record<LocalFormat, (value: number) => string> = {
  eur: euro,
  pct: percent,
  eurw: (value) => euroWeekly(value) + ' a week',
  yrs: years,
  style: (value) => STYLE_CHOICES.find((choice) => choice.value === value)!.label,
}

/** A tool-local figure as text. */
const formatLocal = (binding: Binding, value: number) =>
  'format' in binding ? LOCAL_FORMATS[binding.format](value) : euro(value)

/** The one-tap figure for an assumption input: a published suggestion, or LifeMap's standard. */
export function toolStandard(plan: AssumptionPlan, toolId: string, key: string) {
  const binding = bindingOf(toolId, key)
  if (!binding) return null
  if ('assumption' in binding) {
    const { assumption } = binding
    const field = fieldOf(assumption)
    const chip = field.market ? suggestionChip(field.market, field.kind, field.afterDirt) : null
    if (chip)
      return { value: inToolUnits(assumption, chip.value)!, text: chip.text, suggested: true }
    if (kindOf(assumption) !== 'standard') return null
    const figure = standardFor(plan, assumption)!
    return {
      value: inToolUnits(assumption, figure)!,
      text: formatAssumption(assumption, figure),
      suggested: false,
    }
  }
  if ('market' in binding) {
    const chip = suggestionChip(binding.market, 'pct')
    return chip && { value: +(chip.value * 100).toFixed(4), text: chip.text, suggested: true }
  }
  if ('standard' in binding) {
    const value = standardValue(binding.standard) as number
    return { value, text: formatLocal(binding, value), suggested: false }
  }
  return null
}

/** How LifeMap sets an assumption until the customer chooses ("Usually between …", "LifeMap uses …"). */
function assumptionGuide(plan: AssumptionPlan, key: string, rules: Rules) {
  const field = fieldOf(key)
  const kind = kindOf(key)
  if (kind === 'market') {
    const blank = field.kind === 'eur' ? '€0' : '0%'
    return field.optional && !marketSuggestion(field)
      ? `Optional: no published figure, so no suggestion. Leave it blank to count ${blank}.`
      : ''
  }
  if (kind === 'range') {
    const [low, high] = field.range!(rules).map((end) => formatAssumption(key, end))
    return `Usually between ${low} and ${high} (${field.by}).`
  }
  if (kind === 'own') return ''
  const figure = formatAssumption(key, standardFor(plan, key))
  return `LifeMap uses ${figure} (${standardSource(field.standard as StandardKey)}). Change it if you want to use your own.`
}

/** The guidance under an assumption input in a tool. */
export function guideFor(plan: AssumptionPlan, toolId: string, key: string, rules: Rules) {
  const binding = bindingOf(toolId, key)
  if (!binding) return ''
  if ('retirementAge' in binding) return retireHelp(rules)
  if ('assumption' in binding) {
    const { assumption } = binding
    const help = fieldOf(assumption).help ?? guidance(assumption)
    return [assumptionGuide(plan, assumption, rules), kindOf(assumption) === 'market' ? help : '']
      .filter(Boolean)
      .join(' ')
  }
  if ('market' in binding)
    return `Your statement shows your fund charges. ${STANDARDS.fundChg.note}.`
  if ('standard' in binding) {
    const value = standardValue(binding.standard) as number
    return `LifeMap uses ${formatLocal(binding, value)} (${standardSource(binding.standard)}). Change it if you want to use your own.`
  }
  const [low, high] = binding.range(rules)
  return `Usually between ${formatLocal(binding, low)} and ${formatLocal(binding, high)} (${binding.by}).`
}

export type StandardTag = 'mine' | 'set' | null

/** 'mine' once a LifeMap standard input is changed, 'set' while it is LifeMap's, else null. */
export function standardTag(
  plan: Pick<ToolPlan, 'assumptions' | 'moved'>,
  toolId: string,
  key: string,
): StandardTag {
  const binding = bindingOf(toolId, key)
  if (!binding || !isStandardBinding(binding)) return null
  const chosen = 'assumption' in binding && chosenAssumption(plan.assumptions, binding.assumption) != null
  return chosen || plan.moved[key] ? 'mine' : 'set'
}

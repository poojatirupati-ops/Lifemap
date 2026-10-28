// The words around an assumption input in a tool: its one-tap standard, the guidance under it, its tag.
import { chosenAssumption } from '../../domain/planning/assumptions.ts'
import { guideSource, rules2026, type Rules } from '../../domain/planning/rates.ts'
import {
  defaultSettings,
  guidance,
  standardSource,
  standardValue,
  type StandardKey,
} from '../../domain/planning/settings.ts'
import { STANDARDS } from '../../domain/planning/settings.data.ts'
import { euro, euroWeekly, percent } from '../../lib/format.ts'
import type { AssumptionField } from '../me/assumptionFields.data.ts'
import {
  formatAssumption,
  marketSuggestion,
  standardFor as lifeMapFigure,
} from '../me/assumptionText.ts'
import { fieldOf, kindOf } from './assumptions.data.ts'
import type { Binding } from './bindings.data.ts'
import { bindingOf } from './calculators.ts'
import type { CalcPlan } from './context.ts'
import { inToolUnits, isStandardBinding } from './values.ts'
import { years } from './words.ts'

export const STYLE_CHOICES: [number, string][] = [
  [1, '1 · Cautious'],
  [2, '2 · Balanced'],
  [3, '3 · Growth'],
]

export const RETIRE_HELP = `You can usually draw a pension from ${rules2026.pen.earliestAge} (${guideSource('schemeEarliest')} from ${rules2026.guide.schemeEarliest}); State Pension is paid from ${rules2026.sp.age}.`

/** "Use the suggested rate (3.48%) · Central Bank average …" */
function suggestionChip(field: AssumptionField) {
  const suggestion = marketSuggestion(field)
  if (!suggestion) return null
  const published = standardValue(field.market!) as number
  const beforeDirt =
    field.afterDirt && defaultSettings.standards[field.market!].partnerValue == null
      ? ` (${percent(published)} before DIRT)`
      : ''
  const what = /^€/.test(suggestion.shown) ? 'figure (' : 'rate ('
  return {
    value: suggestion.value,
    text: `Use the suggested ${what}${suggestion.shown}) · ${suggestion.source}${beforeDirt}`,
  }
}

/** A tool-local figure as text. */
function formatLocal(binding: Binding, value: number) {
  if (!('format' in binding)) return euro(value)
  if (binding.format === 'pct') return percent(value)
  if (binding.format === 'eurw') return euroWeekly(value) + ' a week'
  if (binding.format === 'yrs') return years(value)
  if (binding.format === 'style') return STYLE_CHOICES.find(([style]) => style === value)![1]
  return euro(value)
}

/** The one-tap figure for an assumption input: a published suggestion, or LifeMap's standard. */
export function standardFor(plan: CalcPlan, toolId: string, key: string) {
  const binding = bindingOf(toolId, key)
  if (!binding) return null
  if ('assumption' in binding) {
    const { assumption } = binding
    const field = fieldOf(assumption)
    const chip = field.market ? suggestionChip(field) : null
    if (chip)
      return { value: inToolUnits(assumption, chip.value)!, text: chip.text, suggested: true }
    if (kindOf(assumption) !== 'standard') return null
    const figure = lifeMapFigure(plan, assumption)!
    return {
      value: inToolUnits(assumption, figure)!,
      text: formatAssumption(assumption, figure),
      suggested: false,
    }
  }
  if ('market' in binding) {
    const chip = suggestionChip({ market: binding.market, kind: 'pct' } as AssumptionField)
    return chip && { value: +(chip.value * 100).toFixed(4), text: chip.text, suggested: true }
  }
  if ('standard' in binding) {
    const value = standardValue(binding.standard) as number
    return { value, text: formatLocal(binding, value), suggested: false }
  }
  return null
}

/** How LifeMap sets an assumption until the customer chooses ("Usually between …", "LifeMap uses …"). */
function assumptionGuide(plan: CalcPlan, key: string, rules: Rules) {
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
  const figure = formatAssumption(key, lifeMapFigure(plan, key))
  return `LifeMap uses ${figure} (${standardSource(field.standard as StandardKey)}). Change it if you want to use your own.`
}

/** The guidance under an assumption input in a tool. */
export function guideFor(plan: CalcPlan, toolId: string, key: string, rules: Rules) {
  const binding = bindingOf(toolId, key)
  if (!binding) return ''
  if ('retirementAge' in binding) return RETIRE_HELP
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

/** 'mine' once a LifeMap standard input is changed, 'set' while it is LifeMap's, else null. */
export function standardTag(plan: CalcPlan, toolId: string, key: string): 'mine' | 'set' | null {
  const binding = bindingOf(toolId, key)
  if (!binding || !isStandardBinding(binding)) return null
  const chosen = 'assumption' in binding && chosenAssumption(plan.asm, binding.assumption) != null
  const moved = !!(plan.calcT[toolId] as Record<string, boolean> | undefined)?.[key]
  return chosen || moved ? 'mine' : 'set'
}

/** A range or market assumption keeps its guidance under the slider. */
export function showsRangeGuide(toolId: string, key: string) {
  const binding = bindingOf(toolId, key)
  if (!binding) return false
  if ('assumption' in binding) return ['market', 'range'].includes(kindOf(binding.assumption))
  return 'range' in binding || 'market' in binding
}

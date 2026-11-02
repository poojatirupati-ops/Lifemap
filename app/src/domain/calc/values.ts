// The figures a tool shows, in precedence order: moved in this tool > its statement > Your finances
// > the plan > an assumption > the tool's labelled example. And what is still missing.
import { chosenAssumption } from '../planning/assumptions.ts'
import { standardValue } from '../planning/settings.ts'
import type { Plan } from '../../state/types.ts'
import { clamp } from '../../lib/clamp.ts'
import {
  ASSUMPTION_NAMES,
  fieldOf,
  kindOf,
  TOOL_ASSUMPTIONS,
  type Binding,
} from './bindings.data.ts'
import { allInputs, bindingOf } from './calculators.ts'
import { assumptionValue, type ToolPlan } from './context.ts'
import { prefill } from './prefill.ts'
import type { CalcInput, Calculator } from './types.ts'

export interface ToolFigures {
  /** Each input's and what-if's figure; null = not known yet (a blank field that gates the result). */
  figures: Record<string, number | null>
  /** Inputs that still hold the tool's example figure. */
  examples: string[]
  /** Inputs pre-filled from a figure worked out of the customer's own (with the note why). */
  workedOut: Record<string, string>
  /** Inputs filled from an uploaded statement ("From your statement"). */
  fromStatement: string[]
}

/** An assumption in the tool's own units (rates in %). */
export function inToolUnits(key: string, value: number | string | null) {
  if (value == null) return null
  if (fieldOf(key).kind === 'pct') return +(Number(value) * 100).toFixed(4)
  return Number(value)
}

/** A LifeMap standard: used from the start, tagged "Set by LifeMap". */
export const isStandardBinding = (binding?: Binding) =>
  !!binding &&
  ('assumption' in binding ? kindOf(binding.assumption) === 'standard' : 'standard' in binding)

/** A range or market figure: it keeps its guidance under the slider. */
export const isRangeOrMarket = (binding: Binding) =>
  'assumption' in binding
    ? ['market', 'range'].includes(kindOf(binding.assumption))
    : 'range' in binding || 'market' in binding

/** Until the customer moves it: the standard (or, for other assumptions, only their own choice). */
function assumedFigure(plan: ToolPlan, toolId: string, key: string, binding: Binding) {
  if ('assumption' in binding) {
    const { assumption } = binding
    const value = isStandardBinding(binding)
      ? assumptionValue(plan, assumption)
      : chosenAssumption(plan.assumptions, assumption)
    return inToolUnits(assumption, value)
  }
  const picked = plan.toolPick?.[toolId]?.[key]
  if (picked != null) return picked
  return 'standard' in binding ? (standardValue(binding.standard) as number) : null
}

export function toolFigures(calculator: Calculator, plan: ToolPlan): ToolFigures {
  const { id } = calculator
  const { values: known, workedOut } = prefill(plan, id)
  const figures: Record<string, number | null> = {}
  const examples: string[] = []
  for (const input of allInputs(calculator)) {
    const { key } = input
    if (plan.moved[key] && plan.stored[key] != null) {
      figures[key] = plan.stored[key]
      continue
    }
    const binding = bindingOf(id, key)
    let figure = known[key]
    if (figure === undefined) {
      if (binding) figure = assumedFigure(plan, id, key, binding)
      else {
        figure = input.example
        examples.push(key)
      }
    }
    // stated figures are not rounded to the slider step
    figures[key] = figure == null ? null : clamp(+Number(figure).toFixed(4), input.min, input.max)
  }
  const visibleWorkedOut = Object.fromEntries(
    Object.entries(workedOut).filter(([key, note]) => note && !plan.moved[key]),
  )
  return { figures, examples, workedOut: visibleWorkedOut, fromStatement: plan.statementKeys }
}

/** The assumptions a tool reads that the customer still has to choose (optional ones count 0). */
export const assumptionsToChoose = (asm: Plan['assumptions'], toolId: string) =>
  (TOOL_ASSUMPTIONS[toolId] ?? []).filter(
    (key) =>
      chosenAssumption(asm, key) == null && !fieldOf(key).optional && kindOf(key) !== 'standard',
  )

function missingName(toolId: string, input: CalcInput) {
  const binding = bindingOf(toolId, input.key)
  if (!binding)
    return `add:${input.missingName ?? input.label.replace(/\s*\(.*\)$/, '').toLowerCase()}`
  if ('assumption' in binding) return ASSUMPTION_NAMES[binding.assumption]
  return input.missingName && isRangeOrMarket(binding) ? input.missingName : binding.name
}

/** What is still missing before a result shows: 'add:<figure name>' for a personal figure, else the assumption's name. */
export function missingFigures(
  calculator: Calculator,
  { figures }: ToolFigures,
  asm: Plan['assumptions'],
): string[] {
  const missing = calculator.inputs
    .filter(({ key }) => figures[key] == null)
    .map((input) => missingName(calculator.id, input))
  const toChoose = assumptionsToChoose(asm, calculator.id).map((key) => ASSUMPTION_NAMES[key])
  return [...new Set([...missing, ...toChoose])]
}

/** "Add your gross yearly income", "Choose the second fee (fee B)" */
export function missingText(missing: string) {
  const add = missing.startsWith('add:')
  const name = add ? missing.slice(4) : missing
  return `${add ? 'Add' : 'Choose'} ${name.startsWith('the ') ? name : `your ${name}`}`
}

/** The labelled example: the tool still shows example figures (before a plan). */
export const showsExample = (
  calculator: Calculator,
  { figures, examples }: ToolFigures,
  app: boolean,
) => !app && calculator.inputs.some(({ key }) => examples.includes(key) && figures[key] != null)

// The figures a tool shows, in precedence order: moved in this tool > its statement > Your finances
// > the plan > an assumption > the tool's labelled example. And what is still missing.
import { chosenAssumption } from '../../domain/planning/assumptions.ts'
import { standardValue } from '../../domain/planning/settings.ts'
import { ASSUMPTION_NAMES, fieldOf, kindOf } from './assumptions.data.ts'
import { MISSING_NAMES, TOOL_ASSUMPTIONS, type Binding } from './bindings.data.ts'
import { allInputs, bindingOf, calculatorFor } from './calculators.ts'
import { assumptionValue, type CalcPlan } from './context.ts'
import { clamp } from './maths.ts'
import { prefill } from './prefill.ts'
import type { CalcInput } from './types.ts'

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
export const inToolUnits = (key: string, value: number | string | null) =>
  value == null
    ? null
    : fieldOf(key).kind === 'pct'
      ? +(Number(value) * 100).toFixed(4)
      : Number(value)

/** A LifeMap standard: used from the start, tagged "Set by LifeMap". */
export const isStandardBinding = (binding?: Binding) =>
  !!binding &&
  ('assumption' in binding ? kindOf(binding.assumption) === 'standard' : 'standard' in binding)

/** Until the customer moves it: the standard (or, for other assumptions, only their own choice). */
function assumedFigure(plan: CalcPlan, toolId: string, key: string, binding: Binding) {
  if ('assumption' in binding) {
    const { assumption } = binding
    return inToolUnits(
      assumption,
      isStandardBinding(binding)
        ? assumptionValue(plan, assumption)
        : chosenAssumption(plan.asm, assumption),
    )
  }
  const picked = plan.toolPick?.[toolId]?.[key]
  if (picked != null) return picked
  return 'standard' in binding ? (standardValue(binding.standard) as number) : null
}

const customerMoved = (plan: CalcPlan, toolId: string, key: string) =>
  !!(plan.calcT[toolId] as Record<string, boolean> | undefined)?.[key]

export function toolFigures(plan: CalcPlan, toolId: string): ToolFigures {
  const calculator = calculatorFor(toolId)
  const id = calculator.id
  const { values: known, workedOut } = prefill(plan, id)
  const stored = (plan.calcV[id] ?? {}) as Record<string, number | null>
  const figures: Record<string, number | null> = {}
  const examples: string[] = []
  for (const input of allInputs(calculator)) {
    const { key } = input
    if (customerMoved(plan, id, key) && stored[key] != null) {
      figures[key] = stored[key]
      continue
    }
    const binding = bindingOf(id, key)
    const figure =
      known[key] !== undefined
        ? known[key]
        : binding
          ? assumedFigure(plan, id, key, binding)
          : input.example
    if (known[key] === undefined && !binding) examples.push(key)
    // stated figures are not rounded to the slider step
    figures[key] = figure == null ? null : clamp(+Number(figure).toFixed(4), input.min, input.max)
  }
  const visibleWorkedOut = Object.fromEntries(
    Object.entries(workedOut).filter(([key, note]) => note && !customerMoved(plan, id, key)),
  )
  const fromStatement = (plan.calcSrc[id] as string[] | undefined) ?? []
  return { figures, examples, workedOut: visibleWorkedOut, fromStatement }
}

const bindingType = (binding: Binding) =>
  'assumption' in binding
    ? ['market', 'range'].includes(kindOf(binding.assumption))
      ? 2
      : 3
    : 'retirementAge' in binding
      ? 0
      : 'standard' in binding
        ? 3
        : 2

const bindingName = (binding: Binding) =>
  'assumption' in binding ? ASSUMPTION_NAMES[binding.assumption] : binding.name

const figureName = (toolId: string, input: CalcInput) =>
  MISSING_NAMES[toolId]?.[input.key] ?? input.label.replace(/\s*\(.*\)$/, '').toLowerCase()

/** What is still missing before a result shows: 'add:<figure name>' for a personal figure, else the assumption's name. */
export function missingFigures(plan: CalcPlan, toolId: string): string[] {
  const calculator = calculatorFor(toolId)
  const { figures } = toolFigures(plan, toolId)
  const missing = calculator.inputs
    .filter(({ key }) => figures[key] == null)
    .map((input) => {
      const binding = bindingOf(calculator.id, input.key)
      if (!binding) return 'add:' + figureName(calculator.id, input)
      const ownName = MISSING_NAMES[calculator.id]?.[input.key]
      return ownName && bindingType(binding) === 2 && !('assumption' in binding)
        ? ownName
        : bindingName(binding)
    })
  // optional assumptions (buying fees, deposit earnings) count 0 when blank
  for (const key of TOOL_ASSUMPTIONS[calculator.id] ?? []) {
    if (
      chosenAssumption(plan.asm, key) == null &&
      !fieldOf(key).optional &&
      kindOf(key) !== 'standard'
    )
      missing.push(ASSUMPTION_NAMES[key])
  }
  return [...new Set(missing)]
}

/** "Add your gross yearly income", "Choose the second fee (fee B)" */
export function missingText(missing: string) {
  const add = missing.startsWith('add:')
  const name = add ? missing.slice(4) : missing
  return (add ? 'Add ' : 'Choose ') + (/^the /.test(name) ? name : 'your ' + name)
}

/** The labelled example: the tool still shows example figures (before a plan). */
export function showsExample(plan: CalcPlan, toolId: string) {
  if (plan.app) return false
  const { figures, examples } = toolFigures(plan, toolId)
  return calculatorFor(toolId).inputs.some(
    ({ key }) => examples.includes(key) && figures[key] != null,
  )
}

// What one calculator input shows besides its figure, worked out once per render of the tool.
import type { Rules } from '../../domain/planning/rates.ts'
import { bindingOf } from './calculators.ts'
import type { CalcPlan } from './context.ts'
import { guideFor, showsRangeGuide, standardFor, standardTag, STYLE_CHOICES } from './guide.ts'
import type { CalcInput } from './types.ts'
import type { ToolFigures } from './values.ts'

export type StandardTagKind = 'mine' | 'set' | null

export interface FieldInfo {
  toolId: string
  input: CalcInput
  value: number | null
  fromStatement: boolean
  /** The note when the figure was worked out from the customer's own. */
  workedOut: string
  /** An assumption ("Not chosen yet") rather than a personal figure ("Not added yet"). */
  isAssumption: boolean
  standardTag: StandardTagKind
  /** The one-tap figure, shown while the input is blank (chips) or not filled (number box). */
  standard: { value: number; text: string; suggested: boolean } | null
  guide: string
  /** Range and market assumptions keep their guidance under the slider. */
  rangeGuide: boolean
}

export function fieldInfo(
  plan: CalcPlan,
  toolId: string,
  input: CalcInput,
  figures: ToolFigures,
  rules: Rules,
): FieldInfo {
  const { key } = input
  return {
    toolId,
    input,
    value: figures.figures[key],
    fromStatement: figures.fromStatement.includes(key),
    workedOut: figures.workedOut[key] ?? '',
    isAssumption: !!bindingOf(toolId, key),
    standardTag: standardTag(plan, toolId, key),
    standard: standardFor(plan, toolId, key),
    guide: guideFor(plan, toolId, key, rules),
    rangeGuide: showsRangeGuide(toolId, key),
  }
}

/** "Use the suggested rate (…)" as it is, else "Use the standard (X)". */
export const standardChipText = ({ text, suggested }: NonNullable<FieldInfo['standard']>) =>
  suggested ? text : `Use the standard (${text})`

// whole-number choices are chips, never sliders
export const CHOICES: Record<string, [number, string][]> = {
  yn: [
    [1, 'Yes'],
    [0, 'No'],
  ],
  style: STYLE_CHOICES,
  tax: [
    [20, '20%'],
    [40, '40%'],
  ],
}

export const isChoice = (unit: string) => unit in CHOICES

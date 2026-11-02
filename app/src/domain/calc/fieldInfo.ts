// What one calculator input shows besides its figure, worked out once per render of the tool.
import type { Rules } from '../planning/rates.ts'
import { bindingOf } from './calculators.ts'
import type { ToolPlan } from './context.ts'
import { guideFor, toolStandard, standardTag, type StandardTag } from './guide.ts'
import type { CalcInput } from './types.ts'
import { isRangeOrMarket, type ToolFigures } from './values.ts'

export interface FieldInfo {
  toolId: string
  input: CalcInput
  value: number | null
  fromStatement: boolean
  /** The note when the figure was worked out from the customer's own. */
  workedOut: string
  /** An assumption ("Not chosen yet") rather than a personal figure ("Not added yet"). */
  isAssumption: boolean
  standardTag: StandardTag
  /** The one-tap figure, shown while the input is blank (chips) or not filled (number box). */
  standard: ReturnType<typeof toolStandard>
  guide: string
  /** Range and market assumptions keep their guidance under the slider. */
  rangeGuide: boolean
}

export function fieldInfo(
  plan: ToolPlan,
  toolId: string,
  input: CalcInput,
  figures: ToolFigures,
  rules: Rules,
): FieldInfo {
  const { key } = input
  const binding = bindingOf(toolId, key)
  return {
    toolId,
    input,
    value: figures.figures[key],
    fromStatement: figures.fromStatement.includes(key),
    workedOut: figures.workedOut[key] ?? '',
    isAssumption: !!binding,
    standardTag: standardTag(plan, toolId, key),
    standard: toolStandard(plan, toolId, key),
    guide: guideFor(plan, toolId, key, rules),
    rangeGuide: !!binding && isRangeOrMarket(binding),
  }
}

/** "Use the suggested rate (…)" as it is, else "Use the standard (X)". */
export const standardChipText = ({ text, suggested }: NonNullable<FieldInfo['standard']>) =>
  suggested ? text : `Use the standard (${text})`

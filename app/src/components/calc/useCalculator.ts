// Everything a calculator screen shows, derived from the plan once per change.
import { useMemo } from 'react'
import { useStore } from '../../state/store.ts'
import { categoryById, toolById } from '../explore/tools.data.ts'
import { ADJUSTABLE_TOOLS, EXPERT_FOR_GROUP, INFLATION_TOOLS } from './bindings.data.ts'
import { calculatorFor } from './calculators.ts'
import { calcContext, type CalcPlan } from './context.ts'
import { fieldInfo } from './FieldInfo.ts'
import { missingFigures, showsExample, toolFigures } from './values.ts'

export function calculatorView(plan: CalcPlan, param: string) {
  const calculator = calculatorFor(param)
  const id = calculator.id
  const tool = toolById(id)
  const context = calcContext(plan, id)
  const figures = toolFigures(plan, id)
  const missing = missingFigures(plan, id)
  const info = (input: (typeof calculator.inputs)[number]) =>
    fieldInfo(plan, id, input, figures, context.rules)
  const adjustable = ADJUSTABLE_TOOLS.includes(id)
  const adjusted = !!plan.adjInfl?.[id]
  // inflation matters here (for a switchable tool, only once switched on)
  const usesInflation = INFLATION_TOOLS.includes(id) && (!adjustable || adjusted)
  return {
    id,
    tool,
    category: categoryById(tool.category),
    tip: calculator.tip?.(context),
    inputs: calculator.inputs.map(info),
    whatIfs: calculator.whatIfs?.map(info),
    missing,
    result: missing.length
      ? null
      : calculator.run(figures.figures as Record<string, number>, context),
    example: showsExample(plan, id),
    adjustable,
    adjusted,
    choosingInflation: usesInflation && (plan.infl == null || plan.inflEdit),
    inflationChosen: usesInflation && plan.infl != null && !plan.inflEdit ? plan.infl : null,
    expert: EXPERT_FOR_GROUP[tool.category] ?? 'planner',
  }
}

export const useCalculator = (param: string) => {
  const plan = useStore((store) => store.plan)
  return useMemo(() => calculatorView(plan, param), [plan, param])
}

// Everything a calculator screen shows, derived from the plan fields the tool reads.
import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import {
  ADJUSTABLE_TOOLS,
  EXPERT_FOR_GROUP,
  INFLATION_TOOLS,
} from '../../domain/calc/bindings.data.ts'
import { calculatorFor } from '../../domain/calc/calculators.ts'
import { calcContext, toolPlan, type ToolPlan } from '../../domain/calc/context.ts'
import { fieldInfo } from '../../domain/calc/fieldInfo.ts'
import type { CalcInput, Calculator } from '../../domain/calc/types.ts'
import { missingFigures, showsExample, toolFigures } from '../../domain/calc/values.ts'
import { useStore } from '../../state/store.ts'
import { categoryById, toolById } from '../explore/tools.data.ts'

function calculatorView(calculator: Calculator, plan: ToolPlan) {
  const { id } = calculator
  const tool = toolById(id)
  const context = calcContext(plan, id)
  const figures = toolFigures(calculator, plan)
  const missing = missingFigures(calculator, figures, plan.assumptions)
  const info = (input: CalcInput) => fieldInfo(plan, id, input, figures, context.rules)
  const adjustable = ADJUSTABLE_TOOLS.includes(id)
  const adjusted = !!plan.todaysMoney?.[id]
  // inflation matters here (for a switchable tool, only once switched on)
  const usesInflation = INFLATION_TOOLS.includes(id) && (!adjustable || adjusted)
  return {
    id,
    category: categoryById(tool.category),
    inputs: calculator.inputs.map(info),
    whatIfs: calculator.whatIfs?.map(info),
    missing,
    // a blank figure gates the result, so every figure is known here
    result: missing.length
      ? null
      : calculator.run(figures.figures as Record<string, number>, context),
    example: showsExample(calculator, figures, plan.hasResults),
    adjustable,
    adjusted,
    choosingInflation: usesInflation && (plan.inflation == null || plan.editingInflation),
    inflationChosen:
      usesInflation && plan.inflation != null && !plan.editingInflation ? plan.inflation : null,
    expert: EXPERT_FOR_GROUP[tool.category] ?? 'planner',
  }
}

export function useCalculator(param: string) {
  const calculator = calculatorFor(param)
  const plan = useStore(useShallow((store) => toolPlan(store.plan, store, calculator.id)))
  return useMemo(() => calculatorView(calculator, plan), [calculator, plan])
}

import { calculatorFor } from '../components/calc/calculators.ts'
import { calcContext, type CalcPlan } from '../components/calc/context.ts'
import type { Figures } from '../components/calc/types.ts'
import { missingFigures, toolFigures } from '../components/calc/values.ts'

/** What a calculator's result would add to the plan, or what it still needs first. */
export function calcHandoff(plan: CalcPlan, toolId: string) {
  const missing = missingFigures(plan, toolId)
  if (missing.length) return { missing, goal: null }
  const calculator = calculatorFor(toolId)
  // what-ifs left blank count as 0
  const figures = toolFigures(plan, toolId).figures as Figures
  return { missing, goal: calculator.run(figures, calcContext(plan, calculator.id)).goal }
}

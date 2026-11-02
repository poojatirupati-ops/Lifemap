// What a tool starts from, from what we know: the customer's statement for this tool, Your
// finances (statement > typed) and the plan.
import type { ToolPlan } from './context.ts'
import { EVERYDAY_FILLS } from './everydayFills.ts'
import { knownFigures, type Fill, type Known } from './known.ts'
import { MORTGAGE_FILLS } from './mortgageFills.ts'
import { PENSION_FILLS } from './pensionFills.ts'

const FILLS: Record<string, (known: Known) => Fill> = {
  ...MORTGAGE_FILLS,
  ...PENSION_FILLS,
  ...EVERYDAY_FILLS,
}

/** Tools that start from another tool's figures. */
const SAME_AS: Record<string, string> = {
  ratechange: 'repayment',
  fees: 'lumpsum',
  riskreturn: 'lumpsum',
  realreturn: 'lumpsum',
}

export function prefill(plan: ToolPlan, toolId: string): Required<Fill> {
  const known = knownFigures(plan)
  const fill = FILLS[SAME_AS[toolId] ?? toolId]?.(known)
  return {
    values: {
      ...(known.age >= 18 && { age: known.age }),
      ...fill?.values,
      ...plan.statementFigures,
    },
    workedOut: fill?.workedOut ?? {},
  }
}

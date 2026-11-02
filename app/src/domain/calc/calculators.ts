// Every calculator by id: its inputs (inputs.data) and its run. Names, questions, emoji and groups
// live with Explore (TOOLS).
import { BINDINGS, REDIRECTS } from './bindings.data.ts'
import { emergency, emergencyTip } from './emergency.calc.ts'
import { EVERYDAY } from './everyday.calc.ts'
import { HOME } from './home.calc.ts'
import { inputsOf } from './inputs.data.ts'
import { INVEST } from './invest.calc.ts'
import { RETIRE } from './retire.calc.ts'
import type { Calculator } from './types.ts'

const RUNS = { ...HOME, ...INVEST, emergency, ...RETIRE, ...EVERYDAY }
const TIPS: Record<string, Calculator['tip']> = { emergency: emergencyTip }

const CALCULATORS = new Map(
  Object.entries(RUNS).map(([id, run]): [string, Calculator] => [
    id,
    { id, ...inputsOf(id), tip: TIPS[id], run },
  ]),
)

export const calculatorFor = (id: string) => CALCULATORS.get(REDIRECTS[id] ?? id)!

/** Inputs, then what-ifs. */
export const allInputs = (calculator: Calculator) => [
  ...calculator.inputs,
  ...(calculator.whatIfs ?? []),
]

export const bindingOf = (toolId: string, key: string) => BINDINGS[toolId]?.[key]

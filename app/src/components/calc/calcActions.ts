// What a calculator's controls do.
// TODO(Q-01): move into an explore slice in src/state once the store has per-context slices.
import { clampSafetyMonths } from '../../domain/goals/goals.ts'
import { toast } from '../../state/shell.ts'
import { useStore } from '../../state/store.ts'
import type { CalcPlan } from './context.ts'
import { standardFor } from './guide.ts'
import { missingFigures, missingText } from './values.ts'

const update = (recipe: (plan: CalcPlan) => void) => useStore.getState().update(recipe)

/** The customer moved or typed a figure: it is theirs in this tool from now on. */
export const setFigure = (toolId: string, key: string, value: number) =>
  update((plan) => {
    ;(plan.calcV[toolId] ??= {})[key] = value
    ;((plan.calcT[toolId] ??= {}) as Record<string, boolean>)[key] = true
    // the emergency fund months are the plan's too
    if (toolId === 'emergency' && key === 'mt') plan.asm.safetyMonths = clampSafetyMonths(value)
  })

/** "Use the standard (X)" or "Use the suggested rate (X)". */
export function chooseStandard(toolId: string, key: string) {
  const standard = standardFor(useStore.getState().plan, toolId, key)
  if (standard) setFigure(toolId, key, standard.value)
}

export const toggleTodaysMoney = (toolId: string) =>
  update((plan) => {
    plan.adjInfl = { ...plan.adjInfl, [toolId]: !plan.adjInfl?.[toolId] }
  })

export const changeInflation = () =>
  update((plan) => {
    plan.inflEdit = true
  })

/** Add to my plan: confirm in a sheet, or say what is still missing. */
export function addToPlan(toolId: string) {
  const [missing] = missingFigures(useStore.getState().plan, toolId)
  if (missing) toast(missingText(missing) + ' first')
  else useStore.getState().openSheet('calcadd|' + toolId)
}

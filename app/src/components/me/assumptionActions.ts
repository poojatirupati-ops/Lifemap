import type { Plan } from '../../state/types.ts'
import { useStore } from '../../state/store.ts'
// What Your assumptions' controls do.
import { rules2026 } from '../../domain/planning/rates.ts'
import { ASSUMPTIONS, type AdviserRateField } from '../../domain/planning/assumptionFields.data.ts'
import { storedFigure } from '../../domain/planning/assumptionText.ts'
import { addVersion } from '../../state/versions.ts'

const forget = (plan: Plan, key: string) => {
  if (plan.ratesForAdviser) delete plan.ratesForAdviser[key]
}

/** A chip choice, or a typed figure. */
export function setAssumption(key: string, value: number | string) {
  useStore.getState().update((plan) => {
    forget(plan, key)
    plan.assumptions[key] =
      typeof value === 'string' ? value : storedFigure(ASSUMPTIONS[key], value)
  })
}

/** Back to LifeMap's figure, or to the assumed rate. */
export function resetAssumption(key: string) {
  useStore.getState().update((plan) => {
    delete plan.assumptions[key]
    forget(plan, key)
  })
}

export function capCardRate() {
  useStore.getState().update((plan) => {
    plan.assumptions.cardRate = rules2026.guide.cardCap
    forget(plan, 'cardRate')
    addVersion(plan, 'Credit-card rate: the legal limit for new cards')
  })
}

/** "I don't know my rate": a planning rate, flagged for the adviser to check. */
export function leaveRateForAdviser(key: string, { fallback }: AdviserRateField) {
  useStore.getState().update((plan) => {
    plan.assumptions[key] = fallback
    plan.ratesForAdviser = { ...plan.ratesForAdviser, [key]: true }
    addVersion(plan, 'Rate left for my adviser (planning rate used)')
  })
}

/** Keeps the open group open across changes (the original's S.openAssumption). */
export function rememberOpenGroup(group: string, open: boolean) {
  useStore.getState().update((_, ui) => {
    if (open) ui.openAssumption = group
    else if (ui.openAssumption === group) ui.openAssumption = null
  })
}

// What Your finances (P2), Check your details (P4) and Building your plan (U1) do.
// TODO(Q-01): move into a finances slice in src/state once the store has per-context slices.
import type { FinanceSection } from '../../domain/finances/sections.data.ts'
import { useStore } from '../../state/store.ts'
import { missingChoices } from './requiredChoices.ts'
import { requiredFields } from './status.ts'
import { addVersion } from '../../state/versions.ts'
import { prefersReducedMotion } from '../../hooks/reducedMotion.ts'

/** From Check your details: the section's Back returns to the check. */
export function fixSection(index: number) {
  useStore.getState().update((plan, ui) => {
    if (!plan.hasResults) ui.cameFrom = 'check'
  })
  useStore.getState().openSection(index)
}

export const leaveForAdviser = (key: string) =>
  useStore.getState().update((plan) => {
    plan.acknowledged[key] = true
  })

export const leaveSectionForAdviser = (section: FinanceSection) =>
  useStore.getState().update((plan) => {
    for (const key of requiredFields(section, plan)) plan.acknowledged[key] = true
  })

export const backToMe = () =>
  useStore.getState().update((_, ui) => {
    ui.mePage = 'home'
    ui.financeSection = null
    ui.upload = null
    if (ui.tab === 'exp') ui.expertsPage = 'home'
  })

/** Shows Building your plan, then opens the results in My Plan. */
export const seeResults = () => showResults(true)
export const skipResults = () => showResults(false)

function showResults(checked: boolean) {
  if (missingChoices(useStore.getState().plan).length) return
  useStore.getState().update((plan) => {
    plan.checked = checked
  })
  useStore.getState().go('U1')
  setTimeout(
    () =>
      useStore.getState().update((plan, ui) => {
        plan.hasResults = true
        ui.planBuilder = false
        ui.inShell = true
        ui.tab = 'plan'
        ui.planSegment = 'main'
        ui.planScrollTo = 'results'
        // TODO(R-17): the version history slice; the original keeps a fixed date
        if (!plan.versions.some(({ note }) => /results/.test(note))) {
          addVersion(plan, 'First results')
        }
      }),
    prefersReducedMotion() ? 300 : 1400,
  )
}

// Open the plan report (journey-spec §28), or ask for the answers it still needs.
import { useStore } from '../state/store.ts'
import { showReport } from '../shell/router.ts'
import { planMissing } from '../domain/plan/readiness.ts'
import { addVersion } from '../state/versions.ts'

/** Fetch the report chunk early, on pointerenter/focus of a report button. */
export const preloadReport = () => void import('./ReportDialog.tsx')

export function openReport() {
  const { plan, openSheet, update } = useStore.getState()
  if (planMissing(plan).length) return openSheet('gate|report')
  showReport()
  if (!plan.versions.some((version) => version.note.includes('report')))
    update((draft) => {
      addVersion(draft, 'Report downloaded')
    })
}

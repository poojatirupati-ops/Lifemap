// Open the plan report (journey-spec §28), or ask for the answers it still needs.
import { useStore } from '../state/store.ts'
import { showReport } from '../state/shell.ts'
import { planMissing } from '../domain/plan/readiness.ts'
import { addVersion } from '../state/versions.ts'

export function openReport() {
  const { plan, openSheet, update } = useStore.getState()
  // TODO(R-02): the sheet API packs its argument into the name; ideally openSheet('gate', { for: 'report' })
  if (planMissing(plan).length) return openSheet('gate|report')
  showReport()
  if (!plan.versions.some((version) => version.note.includes('report')))
    update((draft) => {
      addVersion(draft, 'Report downloaded')
    })
}

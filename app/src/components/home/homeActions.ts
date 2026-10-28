// What Home's buttons do that no other screen's actions already cover.
// TODO(Q-01): move into a plan slice in src/state once the store has per-context slices.
import { useStore } from '../../state/store.ts'
import { showSection } from '../plan/planActions.ts'

const update = useStore.getState().update

/** My Plan's what-if, on this goal when one is given. */
export function tryWhatIf(goalId?: number) {
  showSection('wi')
  if (goalId != null) update((plan) => void (plan.wi.g = goalId))
}

/** The sheet on one foundation level (0 is the bottom). */
export const openFoundation = (index: number) => useStore.getState().openSheet(`fnd|${index}`)

/** A goal whose date has passed: open its row on the timeline with the age stepper focused. */
export function changeGoalDate(goalId: number) {
  update((plan) => {
    plan.tab = 'plan'
    plan.planSeg = ''
    plan.planEdit = false
    plan.tlHl = goalId
  })
  useStore.getState().closeSheet()
  requestAnimationFrame(() => {
    const row = document.getElementById(`row-${goalId}`)
    row?.scrollIntoView({ block: 'center', behavior: 'instant' })
    row?.querySelector<HTMLButtonElement>('.stepper button')?.focus({ preventScroll: true })
  })
}

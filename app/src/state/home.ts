import { goTo } from '../shell/router.ts'
import type { SetStore, Store } from './store.ts'

export function createHomeSlice(set: SetStore, get: () => Store) {
  return {
    /** My Plan's what-if, on this goal when one is given. */
    tryWhatIf: (goalId?: number) => {
      get().showSection('wi')
      if (goalId == null) return
      get().update((plan) => void (plan.whatIf.goalId = goalId))
    },
    /** The sheet on one foundation level (0 is the bottom). */
    openFoundation: (index: number) => get().openSheet(`fnd|${index}`),
    /** A goal whose date has passed: open its row on the timeline. */
    changeGoalDate: (goalId: number) => {
      set({ editingGoals: false, highlightedGoal: goalId, sheet: null })
      goTo('/plan')
    },
  }
}

/** What Home's buttons do that no other slice's actions already cover. */
export type HomeActions = ReturnType<typeof createHomeSlice>

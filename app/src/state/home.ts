import type { useStore } from './store.ts'

type StoreState = ReturnType<typeof useStore.getState>

/** What Home's buttons do that no other slice's actions already cover. */
export interface HomeActions {
  /** My Plan's what-if, on this goal when one is given. */
  tryWhatIf: (goalId?: number) => void
  /** The sheet on one foundation level (0 is the bottom). */
  openFoundation: (index: number) => void
  /** A goal whose date has passed: open its row on the timeline. */
  changeGoalDate: (goalId: number) => void
}

export function createHomeSlice(get: () => StoreState): HomeActions {
  return {
    tryWhatIf: (goalId) => {
      get().showSection('wi')
      if (goalId == null) return
      get().update((plan) => {
        plan.whatIf.goalId = goalId
      })
    },
    openFoundation: (index) => get().openSheet(`fnd|${index}`),
    changeGoalDate: (goalId) => {
      get().update((plan) => {
        plan.tab = 'plan'
        plan.planSegment = ''
        plan.editingGoals = false
        plan.highlightedGoal = goalId
      })
      get().closeSheet()
    },
  }
}

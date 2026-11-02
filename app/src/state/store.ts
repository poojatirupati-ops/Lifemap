import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { fresh, freshUi } from './fresh.ts'
import { fromOriginal, toOriginal } from './migrate.ts'
import { normalize } from '../domain/plan/normalize.ts'
import type { Plan, Snapshot, Ui } from './types.ts'
import { createDiscoverySlice, type DiscoveryActions } from './discovery.ts'
import { createGoalsSlice, type GoalsActions } from './goals.ts'
import { createHomeSlice, type HomeActions } from './home.ts'
import { createPlanSlice, type PlanActions } from './plan.ts'
import { createFinancesSlice, type FinancesActions } from './finances.ts'
import { createListsSlice, type ListActions } from './financeLists.ts'
import { createUploadsSlice, type UploadActions } from './uploads.ts'
import { createBookingSlice, type BookingActions } from './booking.ts'
import { createCalcSlice, type CalcActions } from './calc.ts'

export type SetStore = (partial: Partial<Store>) => void

export interface Store
  extends
    Ui,
    DiscoveryActions,
    GoalsActions,
    PlanActions,
    HomeActions,
    FinancesActions,
    ListActions,
    UploadActions,
    CalcActions,
    BookingActions {
  /** The customer's plan: the only part that is saved. */
  plan: Plan

  /** Start over from a snapshot (a fixture, a jump, a restored plan); old field names are migrated. */
  load: (snapshot: Snapshot) => void
  /** Change the plan and the screen state with mutation-style recipes; derived fields are refreshed afterwards. */
  update: (recipe: (plan: Plan, ui: Ui) => void) => void

  go: (screen: string) => void
  openSheet: (sheet: string) => void
  closeSheet: () => void

  switchTab: (tab: string) => void
  openAsk: () => void
  leavePlanBuilder: () => void
  showMoneyLooks: () => void
}

export const useStore = create<Store>()(
  immer<Store>((set, get) => {
    const update = (recipe: (plan: Plan, ui: Ui) => void) =>
      set((draft) => {
        recipe(draft.plan, draft)
        normalize(draft.plan)
      })

    return {
      ...createDiscoverySlice(set, get),
      ...createGoalsSlice(set, get),
      ...createPlanSlice(set, get),
      ...createFinancesSlice(get),
      ...createListsSlice(get),
      ...createUploadsSlice(set, get),
      ...createCalcSlice(set, get),
      ...createHomeSlice(set, get),
      ...createBookingSlice(set, get),
      ...freshUi(),
      plan: fresh(),

      load: (saved) => {
        const ui = freshUi()
        const plan: Record<string, unknown> = {}
        for (const [key, value] of Object.entries(fromOriginal<Snapshot>(saved)))
          Object.assign(key in ui ? ui : plan, { [key]: value })
        set({ ...ui, plan: plan as unknown as Plan })
        update(() => {})
      },
      update,

      go: (screen) => set({ screen, sheet: null }),
      openSheet: (sheet) => set({ sheet }),
      closeSheet: () => set({ sheet: null }),

      switchTab: (tab) => {
        update((plan, ui) => {
          if (tab === 'explore' || ui.tab === 'explore') {
            ui.explorePages = []
            ui.playing = false
          }
          ui.tab = tab
          if (plan.hasResults || !ui.planBuilder) {
            ui.financeSection = null
            ui.upload = null
          }
          if (tab === 'me') ui.mePage = 'home'
          if (tab === 'exp' && !['c1', 'c2', 'c3'].includes(ui.expertsPage)) ui.expertsPage = 'home'
          if (tab === 'plan') {
            ui.planSegment = 'main'
            ui.planScrollTo = 'timeline'
          }
        })
        get().closeSheet()
      },
      openAsk: () => get().openSheet('ask'),
      leavePlanBuilder: () => set({ planBuilder: false }),
      showMoneyLooks: () => set({ tab: 'me', mePage: 'money', sheet: null }),
    }
  }),
)

/** The plan and screen state under the original's field names, for view-equal and golden comparisons. */
export function toSnapshot(store: Store) {
  const ui = Object.fromEntries(Object.keys(freshUi()).map((key) => [key, store[key as keyof Ui]]))
  return toOriginal({ ...ui, ...store.plan })
}

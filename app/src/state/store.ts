import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { fresh, freshUi } from './fresh.ts'
import { OLD_SCREEN_STATE, fromOriginal } from './migrate.ts'
import { normalize } from '../domain/plan/normalize.ts'
import { figures } from '../domain/planning/settings.ts'
import type { Plan, Snapshot, Ui } from './types.ts'
import { goTo } from '../shell/router.ts'
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
  /** Which tenant figures are in use: a change re-runs every selector, so whatever reads a standard in one updates. */
  figuresKey: string

  /** Start over from a snapshot (a fixture, a jump, a restored plan); old field names are migrated. */
  load: (snapshot: Snapshot) => void
  /** Change the plan and the screen state with mutation-style recipes; derived fields are refreshed afterwards. */
  update: (recipe: (plan: Plan, ui: Ui) => void) => void

  openSheet: (sheet: string) => void
  closeSheet: () => void

  /** A tab bar tab: 'home', 'explore', 'plan', 'me' or 'exp'. */
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
      ...createDiscoverySlice(get),
      ...createGoalsSlice(set, get),
      ...createPlanSlice(set, get),
      ...createFinancesSlice(get),
      ...createListsSlice(get),
      ...createUploadsSlice(set, get),
      ...createCalcSlice(set, get),
      ...createHomeSlice(set, get),
      ...createBookingSlice(get),
      ...freshUi(),
      plan: fresh(),
      figuresKey: figures.getState().key,

      load: (saved) => {
        const ui = freshUi()
        const plan: Record<string, unknown> = {}
        for (const [key, value] of Object.entries(fromOriginal<Snapshot>(saved)))
          if (!OLD_SCREEN_STATE.has(key)) Object.assign(key in ui ? ui : plan, { [key]: value })
        set({ ...ui, plan: plan as unknown as Plan })
        update(() => {})
      },
      update,

      openSheet: (sheet) => set({ sheet }),
      closeSheet: () => set({ sheet: null }),

      switchTab: (tab) => {
        update((plan, ui) => {
          ui.playing = false
          if (plan.hasResults || !ui.planBuilder) {
            ui.financeSection = null
            ui.upload = null
          }
          if (tab === 'plan') ui.planScrollTo = 'timeline'
        })
        get().closeSheet()
        const booking = get().resumeBooking
        goTo(tab === 'exp' ? `/experts${booking ? `/${booking}` : ''}` : `/${tab}`)
      },
      openAsk: () => get().openSheet('ask'),
      leavePlanBuilder: () => {
        set({ planBuilder: false })
        goTo('/plan')
      },
      showMoneyLooks: () => {
        get().closeSheet()
        goTo('/me/money')
      },
    }
  }),
)

figures.subscribe(({ key }) => useStore.setState({ figuresKey: key }))

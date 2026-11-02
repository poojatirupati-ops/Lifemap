import { create } from 'zustand'
import { produce } from 'immer'
import { fresh } from './fresh.ts'
import { fromOriginal, toOriginal } from './migrate.ts'
import { normalize } from '../domain/plan/normalize.ts'
import type { Plan, Snapshot } from './types.ts'
import { createDiscoverySlice, type DiscoveryActions } from './discovery.ts'
import { createGoalsSlice, type GoalsActions } from './goals.ts'
import { createHomeSlice, type HomeActions } from './home.ts'
import { createPlanSlice, type PlanActions } from './plan.ts'
import { createFinancesSlice, type FinancesActions } from './finances.ts'
import { createListsSlice, type ListActions } from './financeLists.ts'
import { createUploadsSlice, type UploadActions } from './uploads.ts'
import { createBookingSlice, type BookingActions } from './booking.ts'
import { createCalcSlice, type CalcActions } from './calc.ts'

interface Store
  extends
    DiscoveryActions,
    GoalsActions,
    PlanActions,
    HomeActions,
    FinancesActions,
    ListActions,
    UploadActions,
    CalcActions,
    BookingActions {
  plan: Plan
  screen: string
  sheet: string | null

  /** Replace the plan, screen and sheet with a saved snapshot (a fixture, a jump or a fresh start). */
  load: (snapshot: Snapshot) => void
  // TODO(Q-01): screens still write through this; replace with named actions as they move over
  /** Change the plan with a mutation-style recipe; derived fields are refreshed afterwards. */
  update: (recipe: (plan: Plan) => void) => void

  go: (screen: string) => void
  openSheet: (sheet: string) => void
  closeSheet: () => void

  switchTab: (tab: string) => void
  openAsk: () => void
  leavePlanBuilder: () => void
  showMoneyLooks: () => void
  /** A signed-out visitor hit the wall: remember where they were heading and show sign-in. */
  wallVisitor: (patch: Partial<Plan>) => void
}

export const useStore = create<Store>()((set, get) => {
  const update = (recipe: (plan: Plan) => void) =>
    set(({ plan }) => ({
      plan: produce(plan, (draft) => {
        recipe(draft)
        normalize(draft)
      }),
    }))

  return {
    ...createDiscoverySlice(get),
    ...createGoalsSlice(get),
    ...createPlanSlice(get),
    ...createFinancesSlice(get),
    ...createListsSlice(get),
    ...createUploadsSlice(get),
    ...createCalcSlice(get),
    ...createHomeSlice(get),
    ...createBookingSlice(get),
    plan: fresh(),
    screen: 'D0',
    sheet: null,

    load: (saved) => {
      const { screen = 'D0', sheet = null, ...plan } = fromOriginal<Snapshot>(saved)
      set({ plan: produce(plan, normalize), screen, sheet })
    },
    update,

    go: (screen) => set({ screen, sheet: null }),
    openSheet: (sheet) => set({ sheet }),
    closeSheet: () => set({ sheet: null }),

    switchTab: (tab) => {
      update((plan) => {
        if (tab === 'explore' || plan.tab === 'explore') {
          plan.explorePages = []
          plan.playing = false
        }
        plan.tab = tab
        if (plan.hasResults || !plan.planBuilder) {
          plan.financeSection = null
          plan.upload = null
        }
        if (tab === 'me') plan.mePage = 'home'
        if (tab === 'exp' && !['c1', 'c2', 'c3'].includes(plan.expertsPage)) plan.expertsPage = 'home'
        if (tab === 'plan') {
          plan.planSegment = 'main'
          plan.planScrollTo = 'timeline'
        }
      })
      get().closeSheet()
    },
    openAsk: () => get().openSheet('ask'),
    leavePlanBuilder: () =>
      update((plan) => {
        plan.planBuilder = false
      }),
    showMoneyLooks: () => {
      update((plan) => {
        plan.tab = 'me'
        plan.mePage = 'money'
      })
      get().closeSheet()
    },
    wallVisitor: (patch) =>
      set(({ plan }) => ({ plan: produce({ ...plan, ...patch }, normalize), screen: 'P1' })),
  }
})

/** The plan in the original's saved shape, for view-equal and golden comparisons. */
export function toSnapshot({ plan, screen, sheet }: Pick<Store, 'plan' | 'screen' | 'sheet'>) {
  return toOriginal({ screen, ...plan, sheet })
}

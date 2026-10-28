import { create } from 'zustand'
import { produce } from 'immer'
import { fresh } from './fresh.ts'
import { normalize } from '../domain/plan/normalize.ts'
import type { Plan, Snapshot } from './types.ts'

interface Store {
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
    plan: fresh(),
    screen: 'D0',
    sheet: null,

    load: ({ scr = 'D0', sheet = null, ...plan }) =>
      set({ plan: produce(plan, normalize), screen: scr, sheet }),
    update,

    go: (screen) => set({ screen, sheet: null }),
    openSheet: (sheet) => set({ sheet }),
    closeSheet: () => set({ sheet: null }),

    switchTab: (tab) => {
      update((plan) => {
        if (tab === 'explore' || plan.tab === 'explore') {
          plan.xs = []
          plan.play = false
        }
        plan.tab = tab
        if (plan.app || !plan.pb) {
          plan.fsec = null
          plan.upl = null
        }
        if (tab === 'me') plan.me = 'home'
        if (tab === 'exp' && !['c1', 'c2', 'c3'].includes(plan.exp)) plan.exp = 'home'
        if (tab === 'plan') {
          plan.planSeg = 'main'
          plan.planGo = 'timeline'
        }
      })
      get().closeSheet()
    },
    openAsk: () => {
      update((plan) => {
        plan.ask = { open: null, q: '', a: null, log: [], more: false }
      })
      get().openSheet('ask')
    },
    leavePlanBuilder: () =>
      update((plan) => {
        plan.pb = false
      }),
    showMoneyLooks: () => {
      update((plan) => {
        plan.tab = 'me'
        plan.me = 'money'
      })
      get().closeSheet()
    },
    wallVisitor: (patch) =>
      set(({ plan }) => ({ plan: produce({ ...plan, ...patch }, normalize), screen: 'P1' })),
  }
})

/** The plan in the original's saved shape, for view-equal and golden comparisons. */
export function toSnapshot({ plan, screen, sheet }: Pick<Store, 'plan' | 'screen' | 'sheet'>) {
  return { scr: screen, ...plan, sheet }
}

import { useStore } from '../state/store.ts'

/** Screens a visitor without a session may see: Welcome, What brought you here, Discover, reveal, save. */
export const PUBLIC = ['D0', 'D1', 'DQ', 'DR', 'DS']

/** Sign-in and its code steps: they must pass, or the wall would bounce P1 itself and lose `rt`. */
const SIGN_IN = ['P1', 'P1E', 'P1S']

/** A signed-out visitor heading to `key` is sent to sign-in (P1) instead. */
export const isWalled = (key: string, authed: boolean) =>
  !authed && !PUBLIC.includes(key) && !SIGN_IN.includes(key)

/** Leave the app and shell, show sign-in, and remember in `rt` the screen the visitor wanted. */
export const sendToSignIn = (rt: string) =>
  useStore.getState().wallVisitor({ rt, app: false, shell: false, admin: false })

/** Tabs (and the plan builder) the wall can catch a visitor on; any other key is a screen of its own. */
const TAB_OF: Record<string, { tab: string; pb?: boolean }> = {
  HOME0: { tab: 'home' },
  HOME: { tab: 'home' },
  ME: { tab: 'me' },
  EXP: { tab: 'exp' },
  PLAN0: { tab: 'plan' },
  PLAN: { tab: 'plan' },
  GOALS: { tab: 'plan' },
  B1: { tab: 'plan', pb: true },
  B4: { tab: 'plan', pb: true },
  XPL: { tab: 'explore' },
  XTOPIC: { tab: 'explore' },
  XCAT: { tab: 'explore' },
  CALC: { tab: 'explore' },
  VIDS: { tab: 'explore' },
  VID: { tab: 'explore' },
  MORT: { tab: 'explore' },
}

/** After sign-in, take the visitor to the screen the wall caught them on (`rt`). */
export function returnTo(rt: string) {
  const store = useStore.getState()
  const target = TAB_OF[rt]
  if (!target) {
    store.update((plan) => {
      plan.rt = undefined
      plan.shell = false
      plan.app = false
    })
    return store.go(rt)
  }
  store.update((plan) => {
    plan.rt = undefined
    plan.shell = !plan.app
    plan.pb = !!target.pb
  })
  store.switchTab(target.tab)
  if (target.pb) store.go(rt)
}

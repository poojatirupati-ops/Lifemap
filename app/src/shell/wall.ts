import { useStore } from '../state/store.ts'

/** Sign-in and its code step: the only screens without a session (or the wall would bounce P1 itself and lose `rt`). */
const SIGN_IN = ['P1', 'P1E']

/** A signed-out visitor heading anywhere else is sent to sign-in (P1) instead. */
export const isWalled = (key: string, authed: boolean) => !authed && !SIGN_IN.includes(key)

/** Leave the app and shell, show sign-in, and remember in `rt` the screen the visitor wanted. */
export function sendToSignIn(rt: string) {
  useStore.getState().update((plan, ui) => {
    plan.hasResults = false
    Object.assign(ui, { returnTo: rt, inShell: false, adminView: false, screen: 'P1' })
  })
}

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
    store.update((plan, ui) => {
      ui.returnTo = undefined
      ui.inShell = false
      plan.hasResults = false
    })
    return store.go(rt)
  }
  store.update((plan, ui) => {
    ui.returnTo = undefined
    ui.inShell = !plan.hasResults
    ui.planBuilder = !!target.pb
  })
  store.switchTab(target.tab)
  if (target.pb) store.go(rt)
}

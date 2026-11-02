import { authClient } from './client.ts'
import { hasAcknowledgedNotice } from './consents.ts'
import { PLAN_KEY, loadPlan, queryClient, send } from './planSync.ts'
import { testAuthOn } from '../lib/lmTestHook.ts'
import { returnTo } from '../shell/wall.ts'
import { fresh } from '../state/fresh.ts'
import { startFrom, toast, useShell } from '../state/shell.ts'
import { useStore } from '../state/store.ts'
import { DISCOVER_SIX } from '../domain/discovery/questions.data.ts'
import { questionScreen } from '../state/discovery.ts'
import type { Plan, Ui } from '../state/types.ts'

type User = Pick<typeof authClient.$Infer.Session.user, 'name' | 'email'>

/** Where an unfinished onboarding resumes: Welcome, What brought you here, the next open question, or the reveal. */
function resumeOnboarding(plan: Plan, ui: Ui) {
  const open = DISCOVER_SIX.findIndex(({ id }) => plan.answers[id] == null)
  ui.inShell = false
  if (open > 0) plan.discoverStep = open
  if (open === 0) ui.screen = plan.why.length ? 'D1' : 'D0'
  else ui.screen = open < 0 ? 'DR' : questionScreen(open)
}

/** Brings back the user's saved plan; with none, keeps this browser's and fills in the account. */
async function restoreSavedPlan(user: User) {
  const saved = (await loadPlan().catch(() => null))?.plan
  const store = useStore.getState()
  if (!saved?.goals) {
    store.update((plan) => {
      plan.account.name ||= user.name
      plan.account.email = user.email
      plan.account.emailVerified = true
    })
    return
  }
  store.load({
    ...saved,
    account: { ...saved.account, emailVerified: true },
  })
}

/** Onboarding keys: on page load the wall catches Welcome (the fresh start) before the session is known, so it is no target. */
const ONBOARDING = new Set(['D0', 'D1', 'DQ', 'DR'])

/** A finished onboarding opens Home (or the screen the wall caught, `rt`); an unfinished one resumes. */
export function land(rt = useStore.getState().returnTo) {
  const { plan, update } = useStore.getState()
  const done = plan.onboarded || plan.hasResults
  update((draft, ui) => {
    Object.assign(ui, { planBuilder: false, sheet: null, returnTo: undefined })
    if (!done) return resumeOnboarding(draft, ui)
    ui.inShell = true
    ui.tab = 'home'
  })
  if (done && rt && !ONBOARDING.has(rt)) returnTo(rt)
}

/** ?invitation=<id> from an invite email: join that tenant and make it the active one. Kept in the URL through sign-in. */
async function acceptInvitation() {
  const url = new URL(location.href)
  const invitationId = url.searchParams.get('invitation')
  if (!invitationId) return
  const { data, error } = await authClient.organization.acceptInvitation({ invitationId })
  url.searchParams.delete('invitation')
  history.replaceState(null, '', url)
  if (error) return toast("Couldn't accept the invitation. Ask for a new one.")
  await authClient.organization.setActive({ organizationId: data.invitation.organizationId })
}

/**
 * After any sign-in (code, passkey, organisation SSO, or a session found on load):
 * join an invited tenant, restore the plan, then ask a new account for its details or land.
 */
export async function enterApp(user: User) {
  useShell.setState({ authed: true }) // signed in now; the session hook catches up after
  const rt = useStore.getState().returnTo
  await acceptInvitation()
  const [known] = await Promise.all([hasAcknowledgedNotice(), restoreSavedPlan(user)])
  if (!known) return useStore.getState().go('P1D')
  land(rt)
}

/** Forgets everything this browser holds for the user: query cache, plan, wall pass. */
function clearLocal() {
  queryClient.removeQueries({ queryKey: PLAN_KEY })
  useShell.setState({ authed: testAuthOn() })
  startFrom(fresh())
}

/** Signs out and returns to sign-in. */
export async function signOut() {
  await authClient.signOut()
  clearLocal()
}

const DELETE_FAILED: Record<string, string> = {
  SESSION_EXPIRED: "We couldn't delete yet: for your safety, sign out, sign in again, then delete.",
}

/** Erases the account on the server (DELETE /api/me), and only after it confirms clears this browser and says so. */
export async function deleteAccount() {
  const response = await send('DELETE', '/api/me').catch(() => null)
  if (response?.ok || response?.status === 401) {
    clearLocal() // signed out now, so the plan sync saves nothing more
    authClient.$store.notify('$sessionSignal') // the server cleared the session: refetch it (now none)
    if (response.ok) return toast('Your account and all your data were deleted')
    return toast('Your data on this device was deleted')
  }
  const { code = '' }: { code?: string } = (await response?.json().catch(() => null)) ?? {}
  toast(
    DELETE_FAILED[code] ?? "We couldn't delete your data. Nothing was deleted. Please try again.",
  )
}

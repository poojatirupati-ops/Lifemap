import { authClient } from './client.ts'
import { CONSENTS_KEY, hasAcknowledgedNotice } from './consents.ts'
import { PLAN_KEY, queryClient, readSavedPlan, send } from './planSync.ts'
import { testAuthOn } from '../lib/lmTestHook.ts'
import { currentPath, goTo, router } from '../shell/router.ts'
import { TENANT_KEY } from '../shell/tenant.ts'
import { fresh } from '../state/fresh.ts'
import { resetJourneyPages } from '../state/journeyPage.ts'
import { startFrom, toast, useShell } from '../state/shell.ts'
import { useStore } from '../state/store.ts'
import { DISCOVER_SIX } from '../domain/discovery/questions.data.ts'
import { questionPath } from '../state/discovery.ts'
import type { Plan } from '../state/types.ts'

type User = Pick<typeof authClient.$Infer.Session.user, 'name' | 'email'>

/** Where an unfinished onboarding resumes: Welcome, What brought you here, the next open question, or the reveal. */
function onboardingPath(plan: Plan) {
  const open = DISCOVER_SIX.findIndex(({ id }) => plan.answers[id] == null)
  if (open === 0) return plan.why.length ? '/why' : '/'
  return open < 0 ? '/personality' : questionPath(open)
}

/** Brings back the user's saved plan once it has been read; with none, keeps this browser's and fills in the account. */
function restore(user: User, saved: Plan | null) {
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

/** Onboarding and sign-in pages: no place to return to after signing in (Welcome is where every fresh visit starts). */
const NO_RETURN = /^\/(?:$|why|discover|personality|sign-in|account|jump)/

/** The page to come back to after sign-in: ?redirect on the sign-in pages (from the wall), else the page the session was found on. */
function redirectTarget() {
  const { pathname, href, search } = router.latestLocation
  if (!/^\/(?:sign-in|account)/.test(pathname)) return href
  return (search as { redirect?: string }).redirect
}

/** ?redirect=<rt> for the next sign-in page, when there is a page to return to. */
export const keepRedirect = (rt = redirectTarget()) =>
  rt && !NO_RETURN.test(new URL(rt, location.origin).pathname)
    ? `?redirect=${encodeURIComponent(rt)}`
    : ''

/** A finished onboarding opens Home (or the page the wall caught, `rt`); an unfinished one resumes. */
export function land(rt = redirectTarget()) {
  const { plan, update } = useStore.getState()
  update((_, ui) => Object.assign(ui, { planBuilder: false, sheet: null }))
  if (!plan.onboarded && !plan.hasResults) return goTo(onboardingPath(plan))
  return goTo(keepRedirect(rt) ? rt! : '/home')
}

/**
 * ?invitation=<id> from an invite email (kept through sign-in inside ?redirect): join that tenant and make it
 * the active one. Returns the page to land on without it.
 */
async function acceptInvitation(rt = '/') {
  const url = new URL(rt, location.origin)
  const invitationId = url.searchParams.get('invitation')
  if (!invitationId) return rt
  url.searchParams.delete('invitation')
  const { data, error } = await authClient.organization.acceptInvitation({ invitationId })
  if (error) toast("Couldn't accept the invitation. Ask for a new one.")
  else await authClient.organization.setActive({ organizationId: data.invitation.organizationId })
  return url.pathname + url.search
}

/** The email (lowercase) the app was entered with; forgotten on sign-out and when the session is found to have ended. */
let enteredAs: string | undefined

/** The session ended (expired, revoked, signed out elsewhere): the next sign-in enters again, even as the same account. */
export const forgetEntered = () => void (enteredAs = undefined)

/**
 * After any sign-in (code, passkey, organisation SSO, or a session found on load or back after an offline reload), once per account:
 * join an invited tenant and land at once; the saved plan and the consents check follow in the background.
 * - Plan sync saves nothing until the plan has been read (no server version), so this browser's plan never saves over the server's.
 *   Once read it is restored, and the landing redone if the user has not moved since.
 * - Only a confirmed "not agreed" sends the account to its details.
 * Both reads wait for the connection and keep asking (sign-out cancels them); another account entering meanwhile ends this one.
 */
export async function enterApp(user: User) {
  const email = user.email.toLowerCase()
  if (enteredAs === email) return
  enteredAs = email
  const stillEntering = () => enteredAs === email
  useShell.setState({ authed: true }) // signed in now; the session hook catches up after
  rememberSignedIn(true)
  forgetAccountQueries() // the last account's plan version and consents must not carry over
  // an invitation switches the active tenant, and the plan and consents belong to the tenant: read them after it
  const rt = await acceptInvitation(redirectTarget())
  if (!stillEntering()) return
  // both reject only when cancelled (sign-out)
  const reading = readSavedPlan().catch(() => null)
  const agreed = hasAcknowledgedNotice(email).catch(() => null)
  // the session (and maybe its tenant) changed: GET /api/tenant again for branding, flags and SSO
  void queryClient.invalidateQueries({ queryKey: TENANT_KEY })
  await land(rt)
  const landedAt = currentPath()
  void agreed.then((answer) => {
    if (stillEntering() && answer === false) void goTo(`/account/details${keepRedirect(rt)}`)
  })
  void reading.then((saved) => {
    if (!saved || !stillEntering()) return
    restore(user, saved.plan)
    if (currentPath() === landedAt) void land(rt) // where the restored plan lands, unless the user has moved on
  })
}

const SIGNED_IN = 'lm-signed-in'

/** Whether this browser had a confirmed session, kept across reloads (an offline reload still passes the wall). */
export function rememberSignedIn(signedIn: boolean) {
  try {
    if (signedIn) localStorage.setItem(SIGNED_IN, '1')
    else localStorage.removeItem(SIGNED_IN)
  } catch {
    // private mode: an offline reload goes to sign-in
  }
}

export function wasSignedIn() {
  try {
    return localStorage.getItem(SIGNED_IN) === '1'
  } catch {
    return false
  }
}

/** The plan version and consents cached for the last account. */
function forgetAccountQueries() {
  queryClient.removeQueries({ queryKey: PLAN_KEY })
  queryClient.removeQueries({ queryKey: CONSENTS_KEY })
}

/** Forgets everything this browser holds for the user: query cache, plan, topic pages, wall pass. */
function clearLocal() {
  enteredAs = undefined
  rememberSignedIn(false)
  void queryClient.cancelQueries()
  forgetAccountQueries()
  useShell.setState({ authed: testAuthOn() })
  startFrom(fresh())
  resetJourneyPages()
  void goTo('/') // the wall sends a signed-out visitor to sign-in
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

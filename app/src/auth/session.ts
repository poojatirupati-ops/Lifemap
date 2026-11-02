import { authClient } from './client.ts'
import { loadPlan, queryClient, send } from './planSync.ts'
import { testAuthOn } from '../lib/lmTestHook.ts'
import { returnTo } from '../shell/wall.ts'
import { fresh } from '../state/fresh.ts'
import { startFrom, toast, useShell } from '../state/shell.ts'
import { useStore } from '../state/store.ts'

type User = Pick<typeof authClient.$Infer.Session.user, 'name' | 'email'>

/** Where a restored plan opens: Home, with no builder or sheet left open. */
const LANDING = { shell: true, tab: 'home', pb: false, sheet: null }

/**
 * Brings back the user's saved plan, landing where the wall caught them (or on Home).
 * With no saved plan, keeps what this browser has and fills in the account. Returns whether a plan was restored.
 */
export async function restoreSavedPlan(user: User) {
  const saved = (await loadPlan().catch(() => null))?.plan
  const store = useStore.getState()
  if (!saved?.goals) {
    store.update((plan) => {
      plan.account.name ||= user.name
      plan.account.email = user.email
      plan.account.emailVerified = true // sv stays false: no SMS provider yet, so the mobile is not verified
    })
    return false
  }
  const rt = store.plan.returnTo
  const blank = fresh()
  const acct = { ...blank.account, ...saved.account, ev: true, sv: false }
  store.load({ ...blank, ...saved, account: acct, ...LANDING })
  if (rt) returnTo(rt)
  return true
}

/** Forgets everything this browser holds for the user: query cache, plan, wall pass. */
function clearLocal() {
  queryClient.clear()
  useShell.setState({ authed: testAuthOn() })
  startFrom(fresh())
}

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

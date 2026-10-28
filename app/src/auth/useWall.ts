import { useEffect, useRef } from 'react'
import { authClient } from './client.ts'
import { loadPlan, queryClient, startPlanSync, stopPlanSync } from './planSync.ts'
import { returnTo } from '../shell/wall.ts'
import { fresh } from '../state/fresh.ts'
import { startFrom, toast, useShell } from '../state/shell.ts'
import { useStore } from '../state/store.ts'
import { testHookOn } from '../lib/lmTestHook.ts'

/** Test-only bypass for the equality tools: a local dev host with localStorage lm-test-auth set. */
function testSignedIn() {
  try {
    return testHookOn(location.hostname, localStorage.getItem('lm-test-auth'))
  } catch {
    return false // private mode
  }
}

interface User {
  name: string
  email: string
}

/**
 * Brings back the user's saved plan, landing where the wall caught them (or on Home).
 * With no saved plan, keeps what this browser has and fills in the account. Returns whether a plan was restored.
 */
export async function restoreSavedPlan(user: User) {
  const saved = (await loadPlan().catch(() => null))?.plan
  const store = useStore.getState()
  if (!saved?.goals) {
    store.update((plan) => {
      plan.acct.name ||= user.name
      plan.acct.email = user.email
      plan.acct.ev = true // sv stays false: no SMS provider yet, so the mobile is not verified
    })
    return false
  }
  const rt = store.plan.rt
  const blank = fresh()
  const acct = { ...blank.acct, ...saved.acct, ev: true, sv: false }
  store.load({ ...blank, ...saved, acct, shell: true, tab: 'home', pb: false, sheet: null })
  if (rt) returnTo(rt)
  return true
}

/** Forgets everything this browser holds for the user: query cache, plan, wall pass. */
function clearLocal() {
  queryClient.clear()
  useShell.setState({ authed: testSignedIn() })
  startFrom(fresh())
}

export async function signOut() {
  await authClient.signOut()
  clearLocal()
}

/**
 * Erases the account on the server (DELETE /api/me), and only after it confirms clears this browser and says so.
 * The plan sync stops first so the reset plan is never saved back.
 */
export async function deleteAccount() {
  const syncing = stopPlanSync()
  const response = await fetch('/api/me', { method: 'DELETE', credentials: 'same-origin' }).catch(() => null)
  if (response?.ok || response?.status === 401) {
    clearLocal()
    authClient.$store.notify('$sessionSignal') // the server cleared the session: refetch it (now none)
    return toast(response.ok ? 'Your account and all your data were deleted' : 'Your data on this device was deleted')
  }
  if (syncing) startPlanSync()
  const code = response && ((await response.json().catch(() => null)) as { code?: string } | null)?.code
  toast(
    code === 'SESSION_EXPIRED'
      ? "We couldn't delete yet: for your safety, sign out, sign in again, then delete."
      : "We couldn't delete your data. Nothing was deleted. Please try again.",
  )
}

/** Keeps the wall's `authed` in step with the session; restores the plan on load and syncs it while signed in. */
export function useWall() {
  const { data, isPending } = authClient.useSession()
  const user = data?.user
  const booting = useRef(true)

  useEffect(() => {
    if (isPending) return
    useShell.setState({ authed: !!user || testSignedIn() })
    const atBoot = booting.current
    booting.current = false
    if (!user) return
    // After an in-app sign-in the account screen restores the plan itself (restoreSavedPlan).
    if (atBoot) void restoreSavedPlan(user)
    startPlanSync()
    return () => void stopPlanSync()
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- once per signed-in user: a session refresh must not restart the sync
  }, [user?.id, isPending])
}

import { useEffect, useRef } from 'react'
import { authClient } from './client.ts'
import { startPlanSync } from './planSync.ts'
import { restoreSavedPlan } from './session.ts'
import { testAuthOn } from '../lib/lmTestHook.ts'
import { useShell } from '../state/shell.ts'

/** Keeps the wall's `authed` in step with the session; restores the plan on load and syncs it while signed in. */
export function useWall() {
  const { data, isPending } = authClient.useSession()
  const { id: userId, name, email } = data?.user ?? {}
  const restoreChecked = useRef(false)

  useEffect(() => {
    if (!isPending) useShell.setState({ authed: !!userId || testAuthOn() })
  }, [userId, isPending])

  // Only a session found on page load restores here; an in-app sign-in restores from the account screen.
  useEffect(() => {
    if (isPending || restoreChecked.current) return
    restoreChecked.current = true
    if (email) void restoreSavedPlan({ name: name ?? '', email })
  }, [isPending, name, email])

  useEffect(() => {
    if (userId) return startPlanSync()
  }, [userId])
}

import { useEffect, useRef } from 'react'
import { authClient } from './client.ts'
import { startPlanSync } from './planSync.ts'
import { enterApp } from './session.ts'
import { testAuthOn } from '../lib/lmTestHook.ts'
import { useShell } from '../state/shell.ts'

/** Keeps the wall's `authed` in step with the session; enters the app on load and syncs the plan while signed in. */
export function useWall() {
  const { data, isPending } = authClient.useSession()
  const { id: userId, name, email } = data?.user ?? {}
  const restoreChecked = useRef(false)

  useEffect(() => {
    if (!isPending) useShell.setState({ authed: !!userId || testAuthOn() })
  }, [userId, isPending])

  // Only a session found on page load (or back from SSO) enters here; an in-app sign-in enters from its own screen.
  useEffect(() => {
    if (isPending || restoreChecked.current) return
    restoreChecked.current = true
    if (email) void enterApp({ name: name ?? '', email })
  }, [isPending, name, email])

  useEffect(() => {
    if (userId) return startPlanSync()
  }, [userId])
}

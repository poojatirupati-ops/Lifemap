import { useEffect } from 'react'
import { authClient } from './client.ts'
import { startPlanSync } from './planSync.ts'
import { enterApp, forgetEntered } from './session.ts'
import { testAuthOn } from '../lib/lmTestHook.ts'
import { useShell } from '../state/shell.ts'

/** Keeps the wall's `authed` in step with the session; enters the app once a session shows and syncs the plan while signed in. */
export function useWall() {
  const { data, isPending } = authClient.useSession()
  const { id: userId, name, email } = data?.user ?? {}

  useEffect(() => {
    if (isPending) return
    useShell.setState({ authed: !!userId || testAuthOn() })
    if (!userId) forgetEntered() // ended elsewhere: the next sign-in enters again
  }, [userId, isPending])

  // A session found on load (or back from SSO, or back online after an offline reload) enters here; enterApp skips an account already entered (an in-app sign-in).
  useEffect(() => {
    if (email) void enterApp({ name: name ?? '', email })
  }, [name, email])

  useEffect(() => {
    if (userId) return startPlanSync()
  }, [userId])
}

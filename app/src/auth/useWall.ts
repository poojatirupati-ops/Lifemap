import { useEffect } from 'react'
import { authClient } from './client.ts'
import { startPlanSync } from './planSync.ts'
import { enterApp, needsEntering, retryEntering } from './session.ts'
import { testAuthOn } from '../lib/lmTestHook.ts'
import { useShell } from '../state/shell.ts'

/** Keeps the wall's `authed` in step with the session; enters the app once a session shows and syncs the plan while signed in. */
export function useWall() {
  const { data, isPending } = authClient.useSession()
  const { id: userId, name, email } = data?.user ?? {}

  useEffect(() => {
    if (!isPending) useShell.setState({ authed: !!userId || testAuthOn() })
  }, [userId, isPending])

  // A session found on load (or back from SSO, or back online after an offline reload) enters here; an in-app sign-in has entered already.
  useEffect(() => {
    if (email && needsEntering(email)) void enterApp({ name: name ?? '', email })
  }, [name, email])

  // entering that failed offline (consents, saved plan) is tried again whenever the session is fetched again
  useEffect(() => {
    if (data) retryEntering()
  }, [data])

  useEffect(() => {
    if (userId) return startPlanSync()
  }, [userId])
}

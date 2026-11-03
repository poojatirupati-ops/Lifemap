import { createFileRoute, redirect } from '@tanstack/react-router'
import { authClient } from '../auth/client.ts'
import { PLAN_KEY, queryClient } from '../auth/planSync.ts'
import { testAuthOn } from '../lib/lmTestHook.ts'
import { useShell } from '../state/shell.ts'

/**
 * Signed in (a session, or in dev a reviewer jump / the localhost test flag). With the API unreachable (offline, or down) a user whose
 * plan is already loaded carries on; anyone else lands on sign-in rather than an error. Only a 401 or no session signs out.
 */
async function signedIn() {
  if (useShell.getState().authed || testAuthOn()) return true
  const { data, error } = await authClient
    .getSession()
    .catch(() => ({ data: null, error: { status: 0 } }))
  if (data) {
    useShell.setState({ authed: true })
    return true
  }
  return !!error && error.status !== 401 && queryClient.getQueryData(PLAN_KEY) !== undefined
}

// The login wall: every page under _auth needs a session; a visitor without one signs in, then comes back here.
export const Route = createFileRoute('/_auth')({
  beforeLoad: async ({ location }) => {
    if (!(await signedIn())) throw redirect({ to: '/sign-in', search: { redirect: location.href } })
  },
})

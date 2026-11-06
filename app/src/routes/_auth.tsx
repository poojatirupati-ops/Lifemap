import { createFileRoute, redirect } from '@tanstack/react-router'
import { authClient } from '../auth/client.ts'
import { rememberSignedIn, wasSignedIn } from '../auth/session.ts'
import { testAuthOn } from '../lib/lmTestHook.ts'
import { useShell } from '../state/shell.ts'

/**
 * Signed in (a session, or in dev a reviewer jump / the localhost test flag). With the API unreachable (offline, or down) a browser that
 * had a confirmed session carries on, even after a reload; anyone else lands on sign-in rather than an error. A 401 signs out.
 */
async function signedIn() {
  if (useShell.getState().authed || testAuthOn()) return true
  const { data, error } = await authClient
    .getSession()
    .catch(() => ({ data: null, error: { status: 0 } }))
  if (data) {
    useShell.setState({ authed: true })
    rememberSignedIn(true)
    return true
  }
  if (!error || error.status === 401) {
    rememberSignedIn(false)
    return false
  }
  return wasSignedIn()
}

// The login wall: every page under _auth needs a session; a visitor without one signs in, then comes back here.
export const Route = createFileRoute('/_auth')({
  beforeLoad: async ({ location }) => {
    if (!(await signedIn())) throw redirect({ to: '/sign-in', search: { redirect: location.href } })
  },
})

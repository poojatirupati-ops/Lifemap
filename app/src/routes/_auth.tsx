import { createFileRoute, redirect } from '@tanstack/react-router'
import { authClient } from '../auth/client.ts'
import { testAuthOn } from '../lib/lmTestHook.ts'
import { useShell } from '../state/shell.ts'

/** Signed in (a session, or in dev a reviewer jump / the localhost test flag). */
async function signedIn() {
  if (useShell.getState().authed || testAuthOn()) return true
  // API unreachable (offline, or down): treat it as signed out, so the visitor lands on sign-in rather than an error.
  const { data } = await authClient.getSession().catch(() => ({ data: null }))
  if (data) useShell.setState({ authed: true })
  return !!data
}

// The login wall: every page under _auth needs a session; a visitor without one signs in, then comes back here.
export const Route = createFileRoute('/_auth')({
  beforeLoad: async ({ location }) => {
    if (!(await signedIn())) throw redirect({ to: '/sign-in', search: { redirect: location.href } })
  },
})

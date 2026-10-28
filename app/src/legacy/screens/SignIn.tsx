import type { Signup } from '../components/auth/DetailsStep.tsx'
import SignInPanel from '../components/auth/SignInPanel.tsx'
import { SIGNUP_KEY } from '../components/auth/signIn.data.ts'
import { auth } from '../identity/authClient.ts'
import type { Route } from '../shell/route.ts'

export const route: Route = { path: '/sign-in', public: true }

// After verification: name, mobile and consents are kept (with a timestamp) under SIGNUP_KEY until B12 (account sync) sends and clears them.
// Sign-out clears them too. The route guard (Shell) sends the person on to returnTo or Home once the session is set.
const keepSignup = (s: Signup) => {
  try { localStorage.setItem(SIGNUP_KEY, JSON.stringify({ ...s, at: new Date().toISOString() })) } catch { /* private mode */ }
}

export default function SignIn() {
  return <SignInPanel client={auth} onSignup={keepSignup} />
}

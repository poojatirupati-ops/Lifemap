import { useEffect, useState } from 'react'
import { z } from 'zod'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useStore } from '../../state/store.ts'
import { sendEmailCode, setAccount, signInWithPasskey } from '../../state/account.ts'
import { useCodeEntry } from '../../state/codeEntry.ts'
import { signInWithGoogle, signInWithOrganisation } from '../../auth/client.ts'
import { toast } from '../../state/shell.ts'
import { useTenant } from '../../shell/tenant.ts'
import Screen from '../../shell/Screen.tsx'
import Brand from '../../components/frame/Brand.tsx'
import { CODE_LENGTH, looksLikeEmail } from '../../domain/identity/signIn.ts'

/** The life goals people plan for: the photo mosaic beside the sign-in form. */
const GOAL_PHOTOS = [
  ['family-couch.jpg', 'Family'],
  ['home-keys.jpg', 'Your home'],
  ['travel-suitcase.jpg', 'Travel'],
  ['retire-couple.jpg', 'Retire well'],
  ['graduation.jpg', 'Education'],
  ['wedding-rings.jpg', 'Big days'],
] as const

// ?redirect: the page the login wall caught the visitor on, opened again after sign-in (auth/session.ts)
export const Route = createFileRoute('/sign-in/')({
  // ?error: Google or the organisation's sign-in failed or was cancelled (auth/client.ts returnHere)
  validateSearch: z.object({
    redirect: z.string().optional().catch(undefined),
    error: z.string().optional().catch(undefined),
  }),
  component: SignIn,
})

function SignIn() {
  // Read once: the input is uncontrolled.
  const [email] = useState(() => useStore.getState().plan.account.email)
  const tenant = useTenant()
  const ready = useStore((store) => looksLikeEmail(store.plan.account.email.trim()))
  const navigate = useNavigate()
  const { error } = Route.useSearch()
  useEffect(() => {
    if (!error) return
    toast("That sign-in didn't finish. Try again, or use an email code.")
    void navigate({ to: '.', search: (search) => ({ ...search, error: undefined }), replace: true })
  }, [error, navigate])
  const [sending, setSending] = useState(false)

  const send = async () => {
    setSending(true)
    const sent = await sendEmailCode()
    setSending(false)
    if (!sent) return
    useCodeEntry.getState().resetCode()
    void navigate({ to: '/sign-in/code', search: (search) => search })
  }

  return (
    <Screen
      quiz
      id="P1"
      note="Sign in first (O-01): one screen for new and returning users. Email code, organisation SSO for SSO tenants, passkey for returning users."
    >
      <div className="sip">
        <main className="sip-form">
          <div className="sip-in">
            <Brand />
            <h1 className="sip-h">Sign in to LifeMap</h1>
            <p className="sip-sub">
              Enter your email and we&apos;ll send you a {CODE_LENGTH}-digit code.
            </p>
            {tenant?.sso ? (
              <button
                className="btn ghost sip-sso"
                onClick={() => signInWithOrganisation(tenant.slug)}
              >
                Sign in with your organisation
              </button>
            ) : null}
            <div className="field" style={{ margin: 0 }}>
              <label htmlFor="a-email">Email</label>
              <div className="si-in">
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                  <rect x="3" y="5.5" width="18" height="13" rx="3" />
                  <path d="m4 8 8 5.5L20 8" />
                </svg>
                <input
                  className="in"
                  id="a-email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email webauthn"
                  defaultValue={email}
                  onInput={(event) => setAccount({ email: event.currentTarget.value })}
                />
              </div>
            </div>
            <button className="btn sip-go" id="acctgo" disabled={!ready || sending} onClick={send}>
              Send my email code
            </button>
            <div className="si-or" aria-hidden="true">
              <span>or</span>
            </div>
            <button className="link si-pk" onClick={signInWithPasskey}>
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                <path d="M12 3a6 6 0 0 0-6 6v2M12 3a6 6 0 0 1 6 6v3M9 21c0-2 1-4 1-6a2 2 0 1 1 4 0c0 2.5-.5 4.500-1.500 6.500M6 15c0 2-.5 4-1 5M18 15.500c0 1.500-.3 3-.8 4.500M12 8a1 1 0 0 0-1 1v1" />
              </svg>
              Sign in with Face ID or a passkey
            </button>
            {tenant?.google ? (
              <button
                className="link si-pk si-google"
                onClick={async () => {
                  const { error } = await signInWithGoogle()
                  if (error) toast("Couldn't open Google sign-in. Use an email code instead.")
                }}
              >
                <svg viewBox="0 0 48 48" width="20" height="20" aria-hidden="true">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                </svg>
                Continue with Google
              </button>
            ) : null}
            <p className="sip-note">New here? The same code creates your account.</p>
          </div>
        </main>
        <aside className="sip-photo" aria-hidden="true">
          {GOAL_PHOTOS.map(([src, label]) => (
            <figure key={src}>
              <img src={`/media/${src}`} alt="" />
              <figcaption>{label}</figcaption>
            </figure>
          ))}
        </aside>
      </div>
    </Screen>
  )
}

import { useState } from 'react'
import { z } from 'zod'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useStore } from '../../state/store.ts'
import { sendEmailCode, setAccount, signInWithPasskey } from '../../state/account.ts'
import { useCodeEntry } from '../../state/codeEntry.ts'
import { signInWithOrganisation } from '../../auth/client.ts'
import { useTenant } from '../../shell/tenant.ts'
import FlowScreen from '../../components/frame/FlowScreen.tsx'
import { CODE_LENGTH, looksLikeEmail } from '../../domain/identity/signIn.ts'

// ?redirect: the page the login wall caught the visitor on, opened again after sign-in (auth/session.ts)
export const Route = createFileRoute('/sign-in/')({
  validateSearch: z.object({ redirect: z.string().optional().catch(undefined) }),
  component: SignIn,
})

function SignIn() {
  // Read once: the input is uncontrolled.
  const [email] = useState(() => useStore.getState().plan.account.email)
  const tenant = useTenant()
  const ready = useStore((store) => looksLikeEmail(store.plan.account.email.trim()))
  const navigate = useNavigate()
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
    <FlowScreen
      id="P1"
      note="Sign in first (O-01): one screen for new and returning users. Email code, organisation SSO for SSO tenants, passkey for returning users."
      title="Sign in to LifeMap"
      sub={`Enter your email and we'll send you a ${CODE_LENGTH}-digit code. New here? The same code creates your account.`}
      foot={
        <button className="btn" id="acctgo" disabled={!ready || sending} onClick={send}>
          Send my email code
        </button>
      }
    >
      <div className="card">
        <div className="field" style={{ margin: 0 }}>
          <label htmlFor="a-email">Email</label>
          <input
            className="in"
            id="a-email"
            type="email"
            autoComplete="email webauthn"
            defaultValue={email}
            onInput={(event) => setAccount({ email: event.currentTarget.value })}
          />
        </div>
      </div>
      {tenant?.sso ? (
        <button className="btn ghost" onClick={() => signInWithOrganisation(tenant.slug)}>
          Sign in with your organisation
        </button>
      ) : null}
      <button className="link" onClick={signInWithPasskey}>
        Sign in with Face ID or a passkey
      </button>
    </FlowScreen>
  )
}

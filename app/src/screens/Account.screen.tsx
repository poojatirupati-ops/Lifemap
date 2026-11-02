import { useState } from 'react'
import { useStore } from '../state/store.ts'
import { sendEmailCode, setAccount, signInWithPasskey } from '../state/account.ts'
import { useCodeEntry } from '../state/codeEntry.ts'
import { signInWithOrganisation } from '../auth/client.ts'
import { useTenant } from '../shell/tenant.ts'
import FlowHead from '../components/frame/FlowHead.tsx'
import { CODE_LENGTH, looksLikeEmail } from '../domain/identity/signIn.ts'

export const key = 'P1'
export const id = key
export const note =
  'Sign in first (O-01): one screen for new and returning users. Email code, organisation SSO for SSO tenants, passkey for returning users.'

export function Head() {
  return FlowHead({
    title: 'Sign in to LifeMap',
    sub: `Enter your email and we'll send you a ${CODE_LENGTH}-digit code. New here? The same code creates your account.`,
  })
}

export function Body() {
  // Read once: the input is uncontrolled.
  const [email] = useState(() => useStore.getState().plan.account.email)
  const tenant = useTenant()

  return (
    <>
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
    </>
  )
}

export function Foot() {
  const ready = useStore((store) => looksLikeEmail(store.plan.account.email.trim()))
  const go = useStore((store) => store.go)
  const [sending, setSending] = useState(false)

  const send = async () => {
    setSending(true)
    const sent = await sendEmailCode()
    setSending(false)
    if (!sent) return
    useCodeEntry.getState().resetCode()
    go('P1E')
  }

  return (
    <button className="btn" id="acctgo" disabled={!ready || sending} onClick={send}>
      Send my email code
    </button>
  )
}

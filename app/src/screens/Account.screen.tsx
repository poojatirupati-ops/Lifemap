import { useState } from 'react'
import { useStore } from '../state/store.ts'
import { sendEmailCode, setAccount } from '../state/account.ts'
import { useCodeEntry } from '../state/codeEntry.ts'
import FlowHead from '../components/frame/FlowHead.tsx'
import { canSendCode, looksLikeEmail } from '../domain/identity/signIn.ts'

export const key = 'P1'
export const id = key
export const note =
  'Account creation once, before Your finances. Consents start UNTICKED (CBI 2025).'

// Head is called as a plain function by ScreenHost (no hooks allowed), so it reads the store directly.
export function Head() {
  const { plan, go } = useStore.getState()
  const prefilled = plan.save.done
    ? ' Your email is filled in from when you saved your results.'
    : ''
  return FlowHead({
    eye: 'Step 3 · Prepare',
    title: 'Secure your account',
    sub: `Before you add any money figures, we check your email and mobile once.${prefilled}`,
    back: () => go('B4'),
  })
}

export function Body() {
  // Read once: the inputs are uncontrolled, and the email hint shows for what was there on arrival.
  const [account] = useState(() => useStore.getState().plan.account)
  const openSheet = useStore((store) => store.openSheet)

  return (
    <>
      <div className="card">
        <div className="field">
          <label htmlFor="a-name">First name</label>
          <input
            className="in"
            id="a-name"
            autoComplete="given-name"
            defaultValue={account.name}
            onInput={(event) => setAccount({ name: event.currentTarget.value })}
          />
        </div>
        <div className="field">
          <label htmlFor="a-email">Email</label>
          <input
            className="in"
            id="a-email"
            type="email"
            autoComplete="email"
            defaultValue={account.email}
            onInput={(event) => setAccount({ email: event.currentTarget.value })}
          />
          {account.email !== '' && !looksLikeEmail(account.email) ? (
            <span className="small" style={{ color: 'var(--gap-t)' }}>
              Check your email address
            </span>
          ) : null}
        </div>
        <div className="field" style={{ margin: 0 }}>
          <label htmlFor="a-mob">Mobile</label>
          <input
            className="in"
            id="a-mob"
            type="tel"
            autoComplete="tel"
            placeholder="08x xxx xxxx"
            defaultValue={account.mobile}
            onInput={(event) => setAccount({ mobile: event.currentTarget.value })}
          />
        </div>
      </div>
      <div className="card">
        <label className="check">
          <input
            type="checkbox"
            defaultChecked={account.termsAccepted}
            onChange={(event) => setAccount({ termsAccepted: event.currentTarget.checked })}
          />
          <span>
            <b>Required:</b> Use my details to build my plan
          </span>
        </label>
        <label className="check">
          <input
            type="checkbox"
            defaultChecked={account.marketingConsent}
            onChange={(event) => setAccount({ marketingConsent: event.currentTarget.checked })}
          />
          <span>Optional: Send me reminders and updates</span>
        </label>
        <p className="small" style={{ margin: '6px 0 0' }}>
          Stored in the EU · never sold · nothing shared with an adviser unless you choose · delete
          everything any time.
        </p>
        <button className="link" onClick={() => openSheet('money')}>
          How LifeMap makes money
        </button>
      </div>
    </>
  )
}

export function Foot() {
  const ready = useStore((store) => canSendCode(store.plan.account))
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

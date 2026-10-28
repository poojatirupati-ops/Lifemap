import { useState, type FormEvent } from 'react'
import { useStore } from '../state/store.ts'
import { toast } from '../state/shell.ts'
import { sendCode } from '../auth/client.ts'
import FlowHead from '../components/frame/FlowHead.tsx'
import { canSendCode, looksLikeEmail } from '../components/account/accountDetails.ts'
import type { Plan } from '../state/types.ts'

export const key = 'P1'
export const id = 'P1'
export const note =
  'Account creation once, before Your finances. Consents start UNTICKED (CBI 2025).'

type Account = Plan['acct']

const setAccount = (patch: Partial<Account>) =>
  useStore.getState().update((plan) => {
    Object.assign(plan.acct, patch)
  })

const typed = (field: 'name' | 'email' | 'mobile') => (event: FormEvent<HTMLInputElement>) =>
  setAccount({ [field]: event.currentTarget.value })

const ticked = (field: 'c1' | 'c2') => (event: FormEvent<HTMLInputElement>) =>
  setAccount({ [field]: event.currentTarget.checked })

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
  const [account] = useState(() => useStore.getState().plan.acct)
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
            onInput={typed('name')}
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
            onInput={typed('email')}
          />
          {account.email && !looksLikeEmail(account.email) && (
            <span className="small" style={{ color: 'var(--gap-t)' }}>
              Check your email address
            </span>
          )}
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
            onInput={typed('mobile')}
          />
        </div>
      </div>
      <div className="card">
        <label className="check">
          <input type="checkbox" defaultChecked={account.c1} onChange={ticked('c1')} />
          <span>
            <b>Required:</b> Use my details to build my plan
          </span>
        </label>
        <label className="check">
          <input type="checkbox" defaultChecked={account.c2} onChange={ticked('c2')} />
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
  const account = useStore((store) => store.plan.acct)
  const go = useStore((store) => store.go)
  const [sending, setSending] = useState(false)

  const send = async () => {
    setSending(true)
    const sent = await sendCode(account.email.trim())
    setSending(false)
    if (sent) go('P1E')
    else toast("Couldn't send the code. Check your connection and try again.")
  }

  return (
    <button className="btn" id="acctgo" disabled={!canSendCode(account) || sending} onClick={send}>
      Send my email code
    </button>
  )
}

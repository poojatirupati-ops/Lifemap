import { useRef, useState } from 'react'
import Button from '../ui/Button.tsx'
import CodeStep from './CodeStep.tsx'
import DetailsStep, { type Signup } from './DetailsStep.tsx'
import { copy } from './signIn.data.ts'
import { useSignIn, type Client } from './useSignIn.ts'
import './auth.css'

type Props = { client: Client; onSignup?: (s: Signup) => void }

export default function SignInPanel({ client, onSignup }: Props) {
  const [create, setCreate] = useState(true)
  const pending = useRef<Signup | null>(null)
  // Details are stored only once the email code has been verified.
  const s = useSignIn(client, () => { if (pending.current) onSignup?.(pending.current) })
  return (
    <main className="auth">
      <h1>{create ? copy.createTitle : copy.signInTitle}</h1>
      <p className="auth-note">{s.step === 'code' ? copy.codeLead(s.email) : create ? copy.createLead : copy.signInLead}</p>
      {/* hidden, not unmounted, so typed details survive 'Use a different email' */}
      <div hidden={s.step !== 'details'}>
        <DetailsStep create={create} busy={s.busy}
          onSubmit={(email, su) => { pending.current = create ? su : { ...su, name: '', mobile: '' }; void s.send(email) }} />
      </div>
      {s.step === 'code' && <CodeStep busy={s.busy} onVerify={c => void s.verify(c)} onResend={() => void s.resend()} onBack={s.back} />}
      {s.error && <p role="alert" className="auth-error">{s.error}</p>}
      {s.message && <p role="status" className="auth-note">{s.message}</p>}
      {s.step === 'details' && (
        <Button variant="link" onClick={() => setCreate(c => !c)}>{create ? 'I already have an account' : 'Create an account'}</Button>
      )}
    </main>
  )
}

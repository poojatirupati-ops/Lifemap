import { useState, type FormEvent } from 'react'
import Button from '../ui/Button.tsx'

type Props = { busy: boolean; onVerify: (code: string) => void; onResend: () => void; onBack: () => void }

export default function CodeStep({ busy, onVerify, onResend, onBack }: Props) {
  const [code, setCode] = useState('')
  const submit = (e: FormEvent) => { e.preventDefault(); if (code.length === 6 && !busy) onVerify(code) }
  return (
    <form className="auth-form" onSubmit={submit}>
      <label>6-digit code
        <input className="auth-code" type="text" inputMode="numeric" autoComplete="one-time-code"
          value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} />
      </label>
      <Button type="submit" disabled={busy || code.length !== 6}>Continue</Button>
      <Button variant="link" onClick={onResend} disabled={busy}>Send a new code</Button>
      <Button variant="link" onClick={onBack}>Use a different email</Button>
    </form>
  )
}

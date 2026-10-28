import { useState, type FormEvent } from 'react'
import Button from '../ui/Button.tsx'
import ConsentChecks from './ConsentChecks.tsx'
import { copy, type ConsentKey } from './signIn.data.ts'

export type Signup = { name: string; mobile: string; consents: Record<ConsentKey, boolean> }
type Props = { create: boolean; busy: boolean; onSubmit: (email: string, signup: Signup) => void }

export default function DetailsStep({ create, busy, onSubmit }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [mobile, setMobile] = useState('')
  const [consents, setConsents] = useState<Record<ConsentKey, boolean>>({ plan: false, updates: false })
  const blocked = busy || !email || !consents.plan || (create && !name)
  const submit = (e: FormEvent) => { e.preventDefault(); if (!blocked) onSubmit(email.trim(), { name, mobile, consents }) }
  return (
    <form className="auth-form" onSubmit={submit}>
      {create && <label>First name<input type="text" autoComplete="given-name" value={name} onChange={e => setName(e.target.value)} /></label>}
      <label>Email<input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} /></label>
      {create && <label>Mobile<input type="tel" autoComplete="tel" value={mobile} onChange={e => setMobile(e.target.value)} /></label>}
      <ConsentChecks value={consents} onChange={(k, v) => setConsents(c => ({ ...c, [k]: v }))} />
      <details><summary>{copy.makesMoneyLink}</summary><p className="auth-note">{copy.makesMoney}</p></details>
      <Button type="submit" disabled={blocked}>{create ? 'Send me a code' : 'Send code'}</Button>
    </form>
  )
}

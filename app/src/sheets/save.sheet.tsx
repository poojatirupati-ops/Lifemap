import { useRef, useState } from 'react'
import { toast } from '../state/shell.ts'
import { useStore } from '../state/store.ts'
import SheetTitle from './SheetTitle.tsx'

export const key = 'save'

const EMAIL = /.+@.+\..+/

function saveProgress(email: string, comms: boolean) {
  const { update, closeSheet } = useStore.getState()
  update((plan) => {
    plan.save = { email, comms, done: true, asked: true }
    if (!plan.account.email) plan.account.email = email
  })
  closeSheet()
  toast('Email noted ✓ Sign in with it to keep your plan')
}

export function Body() {
  const saved = useStore((store) => store.plan.save)
  const email = useRef<HTMLInputElement>(null)
  const comms = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')

  const submit = () => {
    const typed = email.current?.value.trim() ?? ''
    if (!EMAIL.test(typed)) setError('Please enter a valid email.')
    else saveProgress(typed, !!comms.current?.checked)
  }

  return (
    <>
      <SheetTitle>Save and come back later</SheetTitle>
      <p className="sub">
        Sign in with this email to keep your plan. No password, and no money details yet.
      </p>
      <div className="field">
        <label htmlFor="sv-email">Email</label>
        <input
          className="in"
          id="sv-email"
          type="email"
          autoComplete="email"
          defaultValue={saved.email}
          ref={email}
        />
      </div>
      <label className="check">
        <input type="checkbox" id="sv-comms" defaultChecked={saved.comms} ref={comms} />
        <span>Optional: send me tips and updates</span>
      </label>
      <p id="sverr" className="small" style={{ color: 'var(--gap-t)' }} role="alert">
        {error}
      </p>
      <button className="btn" onClick={submit}>
        Save my email
      </button>
    </>
  )
}

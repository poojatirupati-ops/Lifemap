import { useRef } from 'react'
import { toast } from '../state/shell.ts'
import { useStore } from '../state/store.ts'
import SheetTitle from './SheetTitle.tsx'

export const key = 'invite'

function linkInvite(code: string) {
  const { update, closeSheet } = useStore.getState()
  update((plan) => {
    plan.entry = code ? `adviser invite ${code}` : 'adviser invite'
  })
  closeSheet()
  toast('Invite linked')
}

export function Body() {
  const code = useRef<HTMLInputElement>(null)
  return (
    <>
      <SheetTitle>Enter your invite code</SheetTitle>
      <p className="sub">From your adviser or employer.</p>
      <div className="field">
        <label htmlFor="inv">Code</label>
        <input className="in" id="inv" placeholder="e.g. ABC123" ref={code} />
      </div>
      <button className="btn" onClick={() => linkInvite(code.current?.value ?? '')}>
        Continue
      </button>
    </>
  )
}

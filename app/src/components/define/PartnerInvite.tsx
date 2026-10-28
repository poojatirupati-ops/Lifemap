import { useRef, useState } from 'react'
import { useStore } from '../../state/store.ts'
import Emo from '../ui/Emo.tsx'
import {
  cancelPartnerInvite,
  resendPartnerInvite,
  sendPartnerInvite,
  setPartnerDetail,
} from './aboutActions.ts'

/** Invite the partner by email, or, once sent, resend or cancel it. */
export default function PartnerInvite() {
  const { email, sent } = useStore((store) => store.plan.partner)
  const [error, setError] = useState('')
  const input = useRef<HTMLInputElement>(null)

  if (sent) {
    return (
      <div className="card" style={{ background: 'var(--ok-l)', boxShadow: 'none', marginTop: 12 }}>
        <b>
          <Emo>{`💌 Invite saved for ${email}`}</Emo>
        </b>
        <p className="small" style={{ color: 'var(--ink)', margin: '4px 0 0' }}>
          Sending isn't live yet. When it is, they add their own details and you see only what they share.
        </p>
        <div className="row" style={{ gap: 16 }}>
          <button className="link" data-a="presend" onClick={resendPartnerInvite}>
            Resend
          </button>
          <button className="link" data-a="pcancel" onClick={cancelPartnerInvite}>
            Cancel invite
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="field" style={{ margin: '12px 0 0' }}>
      <label htmlFor="p-email">Their email</label>
      <input
        ref={input}
        className="in"
        id="p-email"
        type="email"
        autoComplete="off"
        data-partner="email"
        defaultValue={email}
        onInput={(event) => setPartnerDetail('email', event.currentTarget.value)}
      />
      <p
        id="perr"
        className="small"
        style={{ color: 'var(--gap-t)', margin: 0, minHeight: 4 }}
        role="alert"
      >
        {error}
      </p>
      <button
        className="btn sm"
        style={{ width: '100%', marginTop: 6 }}
        data-a="pinvite"
        onClick={() => setError(sendPartnerInvite(input.current?.value ?? '') ?? '')}
      >
        Send invite
      </button>
    </div>
  )
}

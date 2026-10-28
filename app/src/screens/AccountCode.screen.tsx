import { useEffect } from 'react'
import { useStore } from '../state/store.ts'
import { toast } from '../state/shell.ts'
import { sendCode } from '../auth/client.ts'
import FlowHead from '../components/frame/FlowHead.tsx'
import { useCodeBoxes } from '../components/account/useCodeBoxes.ts'
import { resetCode, typeCode, useCodeEntry, verifyCode } from '../components/account/codeEntry.ts'

export const key = 'P1E'
export const id = 'P1E'
export const note = 'Email code from the API (Better Auth email OTP); the phone step is skipped.'

export function Head() {
  const { plan, go } = useStore.getState()
  return FlowHead({
    eye: 'Step 3 · Prepare',
    title: 'Check your email',
    sub: (
      <>
        We sent a 6-digit code to <b>{plan.acct.email || 'your email'}</b>.
      </>
    ),
    back: () => go('P1'),
  })
}

async function sendAgain() {
  const sent = await sendCode(useStore.getState().plan.acct.email.trim())
  toast(sent ? 'New code sent' : "Couldn't send the code. Check your connection and try again.")
}

export function Body() {
  const error = useCodeEntry((entry) => entry.error)
  const boxes = useCodeBoxes(6, typeCode, verifyCode)
  useEffect(resetCode, [])

  return (
    <div className="card">
      <div className="codebox" role="group" aria-label="6-digit code">
        {boxes.map((box, index) => (
          <input
            key={index}
            {...box}
            inputMode="numeric"
            maxLength={1}
            data-code={index}
            aria-label={`Digit ${index + 1}`}
            autoFocus={index === 0}
          />
        ))}
      </div>
      <p
        id="codeerr"
        className="small"
        style={{ color: 'var(--gap-t)', minHeight: 18 }}
        role="alert"
      >
        {error}
      </p>
      <button className="link" onClick={sendAgain}>
        Send a new code
      </button>
    </div>
  )
}

export function Foot() {
  const checking = useCodeEntry((entry) => entry.checking)
  return (
    <button className="btn" disabled={checking} onClick={verifyCode}>
      Verify
    </button>
  )
}

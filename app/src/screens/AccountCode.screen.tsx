import { useStore } from '../state/store.ts'
import { toast } from '../state/shell.ts'
import { sendEmailCode } from '../state/account.ts'
import { useCodeEntry } from '../state/codeEntry.ts'
import FlowHead from '../components/frame/FlowHead.tsx'
import { useCodeBoxes } from '../hooks/useCodeBoxes.ts'
import { CODE_LENGTH } from '../domain/identity/signIn.ts'

export const key = 'P1E'
export const id = key
export const note = 'Email code from the API (Better Auth email OTP); the phone step is skipped.'

// Called as a plain function by ScreenHost (no hooks allowed), so it reads the store directly.
export function Head() {
  const { plan, go } = useStore.getState()
  return FlowHead({
    eye: 'Step 3 · Prepare',
    title: 'Check your email',
    sub: (
      <>
        We sent a {CODE_LENGTH}-digit code to <b>{plan.account.email || 'your email'}</b>.
      </>
    ),
    back: () => go('P1'),
  })
}

async function sendAgain() {
  if (await sendEmailCode()) toast('New code sent')
}

export function Body() {
  const error = useCodeEntry((entry) => entry.error)
  const typeCode = useCodeEntry((entry) => entry.typeCode)
  const verifyCode = useCodeEntry((entry) => entry.verifyCode)
  const boxes = useCodeBoxes(typeCode, verifyCode)

  return (
    <div className="card">
      <div className="codebox" role="group" aria-label={`${CODE_LENGTH}-digit code`}>
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
  const verifyCode = useCodeEntry((entry) => entry.verifyCode)
  return (
    <button className="btn" disabled={checking} onClick={verifyCode}>
      Verify
    </button>
  )
}

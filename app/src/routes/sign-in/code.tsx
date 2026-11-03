import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { useStore } from '../../state/store.ts'
import { toast } from '../../state/shell.ts'
import { sendEmailCode } from '../../state/account.ts'
import { useCodeEntry } from '../../state/codeEntry.ts'
import FlowScreen from '../../components/frame/FlowScreen.tsx'
import { useCodeBoxes } from '../../hooks/useCodeBoxes.ts'
import { CODE_LENGTH } from '../../domain/identity/signIn.ts'

export const Route = createFileRoute('/sign-in/code')({
  validateSearch: z.object({ redirect: z.string().optional().catch(undefined) }),
  component: Code,
})

async function sendAgain() {
  if (await sendEmailCode()) toast('New code sent')
}

function Code() {
  const email = useStore((store) => store.plan.account.email)
  const navigate = useNavigate()
  const error = useCodeEntry((entry) => entry.error)
  const checking = useCodeEntry((entry) => entry.checking)
  const { typeCode, verifyCode } = useCodeEntry.getState()
  const boxes = useCodeBoxes(typeCode, verifyCode)

  return (
    <FlowScreen
      id="P1E"
      note="Email code from the API (Better Auth email OTP); the phone step is skipped."
      eye="Step 3 · Prepare"
      title="Check your email"
      sub={
        <>
          We sent a {CODE_LENGTH}-digit code to <b>{email || 'your email'}</b>.
        </>
      }
      back={() => void navigate({ to: '/sign-in', search: (search) => search })}
      foot={
        <button className="btn" disabled={checking} onClick={verifyCode}>
          Verify
        </button>
      }
    >
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
    </FlowScreen>
  )
}

import { useState } from 'react'
import { goBack } from '../../shell/nav.ts'
import { useHashPath } from '../../shell/useHashPath.ts'
import type { createAuthClient } from '../../identity/authClient.ts'
import { copy } from './signIn.data.ts'

export type Client = Pick<ReturnType<typeof createAuthClient>, 'sendCode' | 'signIn'>
type Step = 'details' | 'code'

/** The code step is a history entry (#/sign-in?...&step=code), so header Back and browser Back step back to the details. */
const withStep = (hash: string) => `#${hash}${hash.includes('?') ? '&' : '?'}step=code`

/** Two-step flow: email -> 6-digit code. Never throws; errors become calm messages. */
export function useSignIn(client: Client, onDone: () => void) {
  const hash = useHashPath()
  const [email, setEmail] = useState('')
  const step: Step = email && new URLSearchParams(hash.split('?')[1]).get('step') === 'code' ? 'code' : 'details'
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const send = async (to: string, resend = false) => {
    setBusy(true); setError(''); setMessage('')
    const ok = await client.sendCode(to)
    setBusy(false)
    if (!ok) return setError(copy.sendFailed)
    setEmail(to)
    if (step === 'details') location.hash = withStep(hash)
    if (resend) setMessage(copy.resent)
  }
  const verify = async (code: string) => {
    setBusy(true); setError('')
    const ok = await client.signIn(email, code)
    setBusy(false)
    if (ok) onDone(); else setError(copy.badCode)
  }
  return { step, email, busy, message, error, send, resend: () => send(email, true), verify, back: () => { setError(''); setMessage(''); goBack(hash) } }
}

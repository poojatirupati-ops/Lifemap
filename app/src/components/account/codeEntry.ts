import { create } from 'zustand'
import { useStore } from '../../state/store.ts'
import { toast } from '../../state/shell.ts'
import { postConsents } from '../../auth/planSync.ts'
import { signInWithCode } from '../../auth/client.ts'
import { restoreSavedPlan } from '../../auth/useWall.ts'

const CODE_LENGTH = 6

interface CodeEntry {
  /** The digits typed so far on P1E (body), read by its Verify button (foot). */
  code: string
  error: string
  checking: boolean
}

export const useCodeEntry = create<CodeEntry>(() => ({ code: '', error: '', checking: false }))

export const typeCode = (code: string) => useCodeEntry.setState({ code })

export const resetCode = () => useCodeEntry.setState({ code: '', error: '', checking: false })

/**
 * Checks the emailed code. Once signed in the consents are recorded; a returning user gets their saved
 * plan back (landing where the wall caught them), a new one is offered a passkey.
 */
export async function verifyCode() {
  const { code, checking } = useCodeEntry.getState()
  if (checking) return
  if (code.length < CODE_LENGTH) return useCodeEntry.setState({ error: 'Enter all 6 digits.' })

  useCodeEntry.setState({ checking: true })
  const { acct } = useStore.getState().plan
  const error = await signInWithCode(acct.email.trim(), code, acct.name.trim())
  useCodeEntry.setState({ checking: false, error: error ?? '' })
  if (error) return

  await postConsents({ terms: acct.c1, marketing: acct.c2 })
  toast('Email verified')
  // Sets ev only: no SMS provider yet, so the phone step (P1S) is skipped and sv stays false.
  const restored = await restoreSavedPlan({ name: acct.name.trim(), email: acct.email.trim() })
  if (!restored) useStore.getState().go('P1K')
}

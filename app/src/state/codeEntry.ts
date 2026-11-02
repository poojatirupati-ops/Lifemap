import { create } from 'zustand'
import { useStore } from './store.ts'
import { toast } from './shell.ts'
import { typedContact } from './account.ts'
import { CODE_LENGTH } from '../domain/identity/signIn.ts'
import { signInWithCode } from '../auth/client.ts'
import { postConsents } from '../auth/consents.ts'
import { restoreSavedPlan } from '../auth/session.ts'

/** P1E's typed code, shared by its boxes (body) and its Verify button (foot). */
interface CodeEntry {
  code: string
  error: string
  checking: boolean

  typeCode: (code: string) => void
  resetCode: () => void
  verifyCode: () => Promise<void>
}

/** Records the consents; a returning user gets their saved plan back, a new one is offered a passkey. */
async function afterSignIn(contact: { name: string; email: string }) {
  const { termsAccepted: c1, marketingConsent: c2 } = useStore.getState().plan.account
  await postConsents({ terms: c1, marketing: c2 })
  toast('Email verified')
  // Sets ev only: no SMS provider yet, so the phone step (P1S) is skipped and sv stays false.
  const restored = await restoreSavedPlan(contact)
  if (!restored) useStore.getState().go('P1K')
}

export const useCodeEntry = create<CodeEntry>()((set, get) => ({
  code: '',
  error: '',
  checking: false,

  typeCode: (code) => set({ code }),
  resetCode: () => set({ code: '', error: '', checking: false }),
  verifyCode: async () => {
    const { code, checking } = get()
    if (checking) return
    if (code.length < CODE_LENGTH) {
      set({ error: `Enter all ${CODE_LENGTH} digits.` })
      return
    }
    set({ checking: true })
    const contact = typedContact()
    const error = await signInWithCode(contact.email, code, contact.name)
    set({ checking: false, error: error ?? '' })
    if (!error) await afterSignIn(contact)
  },
}))

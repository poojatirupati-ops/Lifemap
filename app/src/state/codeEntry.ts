import { create } from 'zustand'
import { toast } from './shell.ts'
import { typedEmail } from './account.ts'
import { CODE_LENGTH } from '../domain/identity/signIn.ts'
import { signInWithCode } from '../auth/client.ts'
import { enterApp } from '../auth/session.ts'

/** P1E's typed code, shared by its boxes (body) and its Verify button (foot). */
interface CodeEntry {
  code: string
  error: string
  checking: boolean

  typeCode: (code: string) => void
  resetCode: () => void
  verifyCode: () => Promise<void>
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
    const email = typedEmail()
    const error = await signInWithCode(email, code)
    set({ checking: false, error: error ?? '' })
    if (error) return
    toast('Email verified')
    await enterApp({ name: '', email })
  },
}))

import { useStore } from './store.ts'
import { toast } from './shell.ts'
import type { Plan } from './types.ts'
import { fillKnownFinances } from './finances.ts'
import { authClient, sendCode } from '../auth/client.ts'
import { postConsents } from '../auth/consents.ts'
import { enterApp, land } from '../auth/session.ts'

export function setAccount(patch: Partial<Plan['account']>) {
  useStore.getState().update((plan) => {
    Object.assign(plan.account, patch)
  })
}

/** The email as typed on sign-in, without stray spaces. */
export const typedEmail = () => useStore.getState().plan.account.email.trim()

/** Emails a sign-in code to the typed address; says so when it could not be sent. */
export async function sendEmailCode() {
  const sent = await sendCode(typedEmail())
  if (!sent) toast("Couldn't send the code. Check your connection and try again.")
  return sent
}

/** Returning users who added Face ID / a passkey sign in with it instead of a code. */
export async function signInWithPasskey() {
  const { error } = await authClient.signIn.passkey()
  const user = (await authClient.getSession()).data?.user
  if (error || !user) return toast("Couldn't sign in with a passkey. Use an email code instead.")
  await enterApp(user)
}

export interface Details {
  name: string
  terms: boolean
  marketing: boolean
  analytics: boolean
}

/** A new account's first name and consents: recorded on the server, then a passkey is offered. */
export async function saveDetails({ name, terms, marketing, analytics }: Details) {
  if (!(await postConsents({ terms, marketing, analytics }))) return
  await authClient.updateUser({ name })
  setAccount({ name, termsAccepted: terms, marketingConsent: marketing })
  useStore.getState().go('P1K')
}

/** After the passkey offer: on into onboarding (or Home when it is done). */
export function finishAccount(passkey: boolean) {
  useStore.getState().update((draft) => {
    draft.account.passkey = passkey
    fillKnownFinances(draft)
  })
  land()
}

export async function addPasskey() {
  const { error } = await authClient.passkey.addPasskey()
  if (error) {
    toast("Couldn't add a passkey. You can still use email codes.")
    return
  }
  toast('Face ID added')
  finishAccount(true)
}

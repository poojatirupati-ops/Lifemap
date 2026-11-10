import { useStore } from './store.ts'
import { toast } from './shell.ts'
import type { Plan } from './types.ts'
import { fillKnownFinances } from './finances.ts'
import { authClient, sendCode } from '../auth/client.ts'
import { postConsents } from '../auth/consents.ts'
import { enterApp, keepRedirect, land } from '../auth/session.ts'
import { goTo } from '../shell/router.ts'
import { track } from '../analytics/analytics.ts'

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
  track('account_created')
  await authClient.updateUser({ name })
  setAccount({ name, termsAccepted: terms, marketingConsent: marketing })
  void goTo(`/account/passkey${keepRedirect()}`)
}

/** After the passkey offer: on into onboarding (or Home when it is done). */
export function finishAccount(passkey: boolean) {
  useStore.getState().update((draft) => {
    draft.account.passkey = passkey
    fillKnownFinances(draft)
  })
  land()
}

/** Registers Face ID / Touch ID / Windows Hello (or another passkey) for the signed-in user; false when it was not added. */
export async function addPasskey() {
  const { error } = await authClient.passkey.addPasskey()
  if (error) toast("Couldn't add a passkey. You can still use email codes.")
  else toast('Face ID added')
  return !error
}

/** Removes one of the user's passkeys (Me, Privacy & preferences). */
export async function removePasskey(id: string) {
  const { error } = await authClient.passkey.deletePasskey({ id })
  toast(error ? "Couldn't remove the passkey. Try again." : 'Passkey removed')
}

/** Reminders are optional: switching them off is recorded as easily as switching them on. */
export function setReminders(on: boolean) {
  setAccount({ marketingConsent: on })
  void postConsents({ terms: true, marketing: on })
}

/** A square, centre-cropped JPEG of the chosen picture becomes the profile photo. */
export async function changePhoto(file: File | undefined) {
  if (!file) return
  if (!file.type.startsWith('image/')) return toast('Please choose an image')
  const image = await createImageBitmap(file)
  const side = Math.min(image.width, image.height)
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 240
  const [left, top] = [(image.width - side) / 2, (image.height - side) / 2]
  canvas.getContext('2d')!.drawImage(image, left, top, side, side, 0, 0, 240, 240)
  image.close()
  setAccount({ photo: canvas.toDataURL('image/jpeg', 0.85) })
  toast('Photo updated')
}

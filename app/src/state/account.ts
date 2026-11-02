import { useStore } from './store.ts'
import { toast } from './shell.ts'
import type { Plan } from './types.ts'
import { fillKnownFinances } from './finances.ts'
import { authClient, sendCode } from '../auth/client.ts'
import { returnTo } from '../shell/wall.ts'

export function setAccount(patch: Partial<Plan['account']>) {
  useStore.getState().update((plan) => {
    Object.assign(plan.account, patch)
  })
}

/** The name and email as typed on P1, without stray spaces. */
export function typedContact() {
  const { name, email } = useStore.getState().plan.account
  return { name: name.trim(), email: email.trim() }
}

/** Emails a sign-in code to the typed address; says so when it could not be sent. */
export async function sendEmailCode() {
  const sent = await sendCode(typedContact().email)
  if (!sent) toast("Couldn't send the code. Check your connection and try again.")
  return sent
}

/** On to the screen the sign-in wall caught, or Your finances when the customer came from the plan builder. */
export function finishAccount(passkey: boolean) {
  const { plan, update, go } = useStore.getState()
  update((draft) => {
    draft.account.passkey = passkey
    fillKnownFinances(draft)
  })
  if (plan.returnTo) returnTo(plan.returnTo)
  else go('P2')
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

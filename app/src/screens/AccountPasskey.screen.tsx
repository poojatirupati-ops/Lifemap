import { useStore } from '../state/store.ts'
import { toast } from '../state/shell.ts'
import { authClient } from '../auth/client.ts'
import { returnTo } from '../shell/wall.ts'
import FlowHead from '../components/frame/FlowHead.tsx'
import { prefillFinances } from '../components/account/accountDetails.ts'

export const key = 'P1K'
export const id = 'P1K'
export const note = 'Passkey / Face ID offered as an extra after verification.'

export function Head() {
  return FlowHead({
    eye: 'Step 3 · Prepare',
    title: 'Your email is verified ✓',
    sub: 'Want a faster, safer way to sign in next time?',
  })
}

export function Body() {
  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 52 }} aria-hidden="true">
        🔐
      </div>
      <b style={{ fontSize: 17 }}>Use Face ID or a passkey</b>
      <p className="small">No password to remember. You can still use email codes.</p>
    </div>
  )
}

/** On to the screen the sign-in wall caught, or Your finances when the customer came from the plan builder. */
function carryOn(passkey: boolean) {
  const { plan, update, go } = useStore.getState()
  update((draft) => {
    draft.acct.pk = passkey
    prefillFinances(draft)
  })
  if (plan.rt) returnTo(plan.rt)
  else go('P2')
}

async function addPasskey() {
  const { error } = await authClient.passkey.addPasskey()
  if (error) return toast("Couldn't add a passkey. You can still use email codes.")
  toast('Face ID added')
  carryOn(true)
}

export function Foot() {
  return (
    <>
      <button className="btn" onClick={addPasskey}>
        Add Face ID / passkey
      </button>
      <button className="btn ghost" onClick={() => carryOn(false)}>
        Not now
      </button>
    </>
  )
}

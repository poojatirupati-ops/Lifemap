import { addPasskey, finishAccount } from '../state/account.ts'
import FlowHead from '../components/frame/FlowHead.tsx'

export const key = 'P1K'
export const id = key
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

export function Foot() {
  return (
    <>
      <button className="btn" onClick={addPasskey}>
        Add Face ID / passkey
      </button>
      <button className="btn ghost" onClick={() => finishAccount(false)}>
        Not now
      </button>
    </>
  )
}

import { createFileRoute } from '@tanstack/react-router'
import { redirectSearch } from '../../../lib/redirectSearch.ts'
import { addPasskey, finishAccount } from '../../../state/account.ts'
import FlowScreen from '../../../components/frame/FlowScreen.tsx'

// ?redirect: kept from sign-in, opened after this offer (auth/session.ts)
export const Route = createFileRoute('/_auth/account/passkey')({
  validateSearch: redirectSearch,
  component: AccountPasskey,
})

function AccountPasskey() {
  return (
    <FlowScreen
      id="P1K"
      note="Passkey / Face ID offered as an extra after verification."
      eye="Step 3 · Prepare"
      title="Your email is verified ✓"
      sub="Want a faster, safer way to sign in next time?"
      foot={
        <>
          <button className="btn" onClick={async () => (await addPasskey()) && finishAccount(true)}>
            Add Face ID / passkey
          </button>
          <button className="btn ghost" onClick={() => finishAccount(false)}>
            Not now
          </button>
        </>
      }
    >
      <div className="card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 52 }} aria-hidden="true">
          🔐
        </div>
        <b style={{ fontSize: 17 }}>Use Face ID or a passkey</b>
        <p className="small">No password to remember. You can still use email codes.</p>
      </div>
    </FlowScreen>
  )
}

import { useStore } from '../state/store.ts'
import SheetTitle from './SheetTitle.tsx'

export const key = 'profile'

export function Body() {
  const name = useStore((store) => store.plan.account.name)
  const passkey = useStore((store) => store.plan.account.passkey)
  return (
    <>
      <div className="adv">
        <span className="face" aria-hidden="true">
          {(name || 'A')[0]}
        </span>
        <div>
          <SheetTitle style={{ margin: 0 }}>{name || 'You'}</SheetTitle>
          <div className="small">
            {passkey ? 'Signed in with Face ID' : 'Signed in with email code'}
          </div>
        </div>
      </div>
      <button
        className="goal"
        style={{ marginTop: 14 }}
        onClick={() => useStore.getState().openMe('privacy')}
      >
        <span className="ic">🔐</span>
        <b style={{ flex: 1 }}>Privacy & preferences</b>
      </button>
      <button className="goal" onClick={() => useStore.getState().openMe('details')}>
        <span className="ic">🙋</span>
        <b style={{ flex: 1 }}>My details</b>
      </button>
    </>
  )
}

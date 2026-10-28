import { useStore } from '../state/store.ts'
import SheetTitle from './SheetTitle.tsx'

export const key = 'saveprompt'

export function Body() {
  const { openSheet, go } = useStore.getState()
  return (
    <>
      <SheetTitle>Save your progress?</SheetTitle>
      <p className="sub">Get a link by email so you can finish later. Optional.</p>
      <button className="btn" onClick={() => openSheet('save')}>
        Save my progress
      </button>
      <button className="btn ghost" style={{ marginTop: 10 }} onClick={() => go('F4')}>
        Continue without saving
      </button>
    </>
  )
}

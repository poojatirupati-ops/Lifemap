import { useStore } from '../state/store.ts'
import SaveForm from '../components/discover/SaveForm.tsx'

export const key = 'DS'
export const id = 'DS'
export const note =
  'Save your results (§12, MASTER C8): email only, or Skip for now. No password, no money yet. Then straight into the main app.'
export const kind = 'quiz'

export function Body() {
  const go = useStore((store) => store.go)
  return (
    <>
      <div className="qtop">
        <button className="qx" aria-label="Back" onClick={() => go('DR')}>
          ‹
        </button>
        <span style={{ flex: 1 }} />
      </div>
      <SaveForm />
    </>
  )
}

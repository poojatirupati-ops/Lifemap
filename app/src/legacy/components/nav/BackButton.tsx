import { goBack } from '../../shell/nav.ts'

/** Header back for every non-root screen. 44px target; Back follows history, or steps up the flow when there is none. */
export default function BackButton({ hash }: { hash: string }) {
  return (
    <div className="navbar">
      <button type="button" className="back" onClick={() => goBack(hash)}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
        Back
      </button>
    </div>
  )
}

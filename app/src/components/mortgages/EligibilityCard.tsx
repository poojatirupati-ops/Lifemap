import { useStore } from '../../state/store.ts'

/** The invitation to the 4-question borrowing quiz, shown to buyers. */
export default function EligibilityCard() {
  const openSheet = useStore((s) => s.openSheet)
  // TODO(R-29): the elig sheet (R-31) starts its quiz at question 1 each time it opens
  const startQuiz = () => openSheet('elig')
  return (
    <div className="elg2">
      <div
        className="elg2-ph"
        style={{ backgroundImage: 'url(media/family-couch.jpg)' }}
        aria-hidden="true"
      >
        <span
          className="elg2-in"
          style={{ backgroundImage: 'url(media/couple-planning.jpg)' }}
        ></span>
      </div>
      <div className="elg2-tx">
        <span className="elg2-eye">Mortgage eligibility</span>
        <b>How much could you borrow?</b>
        <p>Take our 5 minute quiz and see a rough borrowing amount and home price.</p>
        <button className="elg2-go" data-a="elig" onClick={startQuiz}>
          Start eligibility quiz <i aria-hidden="true">→</i>
        </button>
        <span className="elg2-t">
          <span aria-hidden="true">⏱</span> About 5 minutes · no credit check
        </span>
      </div>
    </div>
  )
}

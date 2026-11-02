import { adviserOf, firstName, stageOf } from '../../domain/identity/booking.ts'
import { useStore } from '../../state/store.ts'

/** Each step's main button. */
export default function ExpertsFoot() {
  const stage = useStore(({ plan }) => stageOf(plan))
  const book = useStore((store) => store.plan.booking)
  const adviserFirstName = useStore(({ plan }) => firstName(adviserOf(plan).name))
  const { showStage, answerProfileFirst, confirmBooking, switchTab, bookAdviser } =
    useStore.getState()
  switch (stage) {
    case 'c0':
      return (
        <>
          <button className="btn" onClick={answerProfileFirst}>
            Answer the questions
          </button>
          <button className="btn ghost" onClick={() => showStage('c1')}>
            Skip for now
          </button>
        </>
      )
    case 'c1':
      return (
        <button className="btn" onClick={() => showStage('c2')}>
          Choose {adviserFirstName}
        </button>
      )
    case 'c2': {
      const ready = Object.values(book.share).some(Boolean) && book.agree
      return (
        <button className="btn" id="sharego" disabled={!ready} onClick={() => showStage('c3')}>
          Pick a time
        </button>
      )
    }
    case 'c3':
      return (
        <button className="btn" disabled={!book.slot} onClick={confirmBooking}>
          Confirm booking
        </button>
      )
    case 'c4':
      return (
        <button className="btn" onClick={() => switchTab('plan')}>
          Back to my plan
        </button>
      )
    case 'booked':
      // TODO(R-31): ScreenHost still draws an empty .foot; the original has none after booking
      return null
    case 'home':
      return (
        <button className="btn sun" onClick={bookAdviser}>
          📅 Book my adviser meeting
        </button>
      )
  }
}

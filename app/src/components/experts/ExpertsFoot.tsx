import { useBook } from '../../bookings/bookings.ts'
import { useFeature } from '../../shell/tenant.ts'
import { adviserOf, firstName, stageOf } from '../../domain/identity/booking.ts'
import { useStore } from '../../state/store.ts'

/** Each step's main button. */
export default function ExpertsFoot() {
  const stage = useStore((store) => stageOf(store.expertsPage, store.plan.booking.done))
  const book = useStore((store) => store.plan.booking)
  const adviserFirstName = useStore(({ plan }) => firstName(adviserOf(plan).name))
  const canBook = useFeature('adviserBooking')
  const confirm = useBook()
  const { showStage, answerProfileFirst, switchTab, bookAdviser } = useStore.getState()
  // tenant without adviserBooking: no way into the booking steps
  if (!canBook && (stage === 'home' || stage === 'c1' || stage === 'c2' || stage === 'c3'))
    return null
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
        <button
          className="btn"
          disabled={!book.slot || confirm.isPending}
          onClick={() => confirm.mutate()}
        >
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

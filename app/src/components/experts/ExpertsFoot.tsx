import { useAdviser, useBook } from '../../bookings/bookings.ts'
import { useFeature } from '../../shell/tenant.ts'
import { firstName, type Stage } from '../../domain/identity/booking.ts'
import { useStore } from '../../state/store.ts'

/** Each step's main button. */
export default function ExpertsFoot({ stage }: { stage: Stage }) {
  const book = useStore((store) => store.plan.booking)
  const adviser = useAdviser()
  const canBook = useFeature('adviserBooking')
  const start = useBook()
  const { showStage, answerProfileFirst, switchTab, bookAdviser } = useStore.getState()
  // tenant without adviserBooking or without advisers: no way into the booking steps
  if (
    (!canBook || !adviser) &&
    (stage === 'home' || stage === 'c1' || stage === 'c2' || stage === 'c3')
  )
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
          Choose {firstName(adviser?.name ?? '')}
        </button>
      )
    case 'c2': {
      const ready = Object.values(book.share).some(Boolean) && book.agree
      return (
        <button
          className="btn"
          id="sharego"
          disabled={!ready || start.isPending}
          onClick={() => adviser && start.mutate(adviser.id)}
        >
          Pick a time
        </button>
      )
    }
    case 'c3': // Cal.com's own button books it
      return null
    case 'c4':
      return (
        <button className="btn" onClick={() => switchTab('plan')}>
          Back to my plan
        </button>
      )
    case 'home':
      return (
        <button className="btn sun" onClick={bookAdviser}>
          📅 Book my adviser meeting
        </button>
      )
  }
}

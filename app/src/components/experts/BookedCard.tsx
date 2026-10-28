import { saveMeeting } from '../../report/saveFiles.ts'
import { useStore } from '../../state/store.ts'
import { adviserOf } from './booking.ts'

const SLOT = /^(\w+)\s+(\d+)\s+(\w+)/

// Inside a shared Claude page the meeting is saved as text, not added to a calendar.
const canOnlySaveText = () => {
  try {
    return typeof (window as { claude?: { use?: unknown } }).claude?.use === 'function'
  } catch {
    return false
  }
}

/** The confirmed meeting: date tile, when, how and with whom, and a calendar button. */
export default function BookedCard() {
  const plan = useStore((store) => store.plan)
  const { slot, mode } = plan.book
  const adviser = adviserOf(plan)
  const date = SLOT.exec(slot ?? '')
  return (
    <div className="card bk-hero">
      <div className="bk-top">
        <span className="bk-d" aria-hidden="true">
          {date ? (
            <>
              <small>{date[1]}</small>
              <b>{date[2]}</b>
              <small>{date[3]}</small>
            </>
          ) : (
            '📅'
          )}
        </span>
        <div>
          <span className="bk-ok">
            <i aria-hidden="true">✓</i> Confirmed
          </span>
          <b className="bk-when">{slot}</b>
          <span className="bk-who">
            {mode} with {adviser.name}
          </span>
        </div>
      </div>
      <p className="bk-note">Confirmation sent by email and SMS.</p>
      <button className="bk-cal" onClick={() => saveMeeting({ adviser: adviser.name, mode, slot })}>
        {canOnlySaveText() ? '📄 Save meeting details' : '📆 Add to my calendar'}
      </button>
    </div>
  )
}

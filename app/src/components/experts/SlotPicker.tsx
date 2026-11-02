import { makeSlots } from '../../domain/identity/slots.ts'
import { useStore } from '../../state/store.ts'

const MODES = ['Video', 'In person']
const dayOf = (slot: string) => slot.split(' · ')[0]

/** Meeting type, then a day strip and that day's times. */
export default function SlotPicker() {
  const book = useStore((store) => store.plan.booking)
  const setBooking = useStore((store) => store.setBooking)
  const slots = makeSlots()
  const days = [...new Set(slots.map(dayOf))]
  const shownDay = book.day || (book.slot ? dayOf(book.slot) : days[0])
  return (
    <>
      <div className="seg" role="group" aria-label="Meeting type">
        {MODES.map((mode) => (
          <button
            key={mode}
            className={book.mode === mode ? 'on' : ''}
            aria-pressed={book.mode === mode}
            onClick={() => setBooking({ mode })}
          >
            {mode}
          </button>
        ))}
      </div>
      <div className="sec">
        <h3>Choose a day</h3>
      </div>
      <div className="dstrip" role="group" aria-label="Day">
        {days.map((day) => {
          const [weekday, date, month] = day.split(' ')
          return (
            <button
              key={day}
              className={day === shownDay ? 'dday on' : 'dday'}
              aria-pressed={day === shownDay}
              onClick={() => setBooking({ day })}
            >
              <span>{weekday}</span>
              <b>{date}</b>
              <small>{month}</small>
              {book.slot?.startsWith(`${day} ·`) ? <i aria-hidden="true"></i> : null}
            </button>
          )
        })}
      </div>
      <div className="sec">
        <h3>Choose a time</h3>
      </div>
      <div className="chips" role="group" aria-label="Time">
        {slots
          .filter((slot) => dayOf(slot) === shownDay)
          .map((slot) => (
            <button
              key={slot}
              className={book.slot === slot ? 'chip sel' : 'chip'}
              aria-pressed={book.slot === slot}
              onClick={() => setBooking({ slot })}
            >
              {slot.split(' · ')[1]}
            </button>
          ))}
      </div>
    </>
  )
}

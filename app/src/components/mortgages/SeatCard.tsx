import { useMortgagePage } from '../../state/mortgage.ts'

/** A free live session with a mortgage broker, and a button to save a seat. */
export default function SeatCard({
  index,
  when,
  title,
}: {
  index: number
  when: string
  title: string
}) {
  const seat = useMortgagePage((page) => `${page.situation}-${index}`)
  const saved = useMortgagePage((page) => !!page.seats[seat])
  const toggleSeat = useMortgagePage((page) => page.toggleSeat)
  const [day, ...time] = when.split(' ')

  return (
    <div className="card lv3">
      <span className="lv2-d" aria-hidden="true">
        <small>{day}</small>
        <b>{time.join(' ')}</b>
      </span>
      <span className="lv3-m">
        <b>{title}</b>
        <small>
          <i className="lv3-dot" aria-hidden="true"></i>Live · free · with a mortgage broker
        </small>
      </span>
      <button
        className="mp-seat"
        data-a="mpseat"
        data-p={seat}
        aria-pressed={saved}
        onClick={() => toggleSeat(index)}
      >
        {saved ? '✓ Seat saved' : 'Save seat'}
      </button>
    </div>
  )
}

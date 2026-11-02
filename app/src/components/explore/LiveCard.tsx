import type { CSSProperties } from 'react'
import { expertName, type LiveSession } from './explore.data.ts'
import { remindMe } from '../../state/explore.ts'

/** A free live session with an expert, and a reminder button. */
export default function LiveCard({
  session,
  style,
}: {
  session: LiveSession
  style?: CSSProperties
}) {
  const [day, ...time] = session.when.split(' ')
  return (
    <div className="card lv3" style={style}>
      <span className="lv2-d" aria-hidden="true">
        <small>{day}</small>
        <b>{time.join(' ')}</b>
      </span>
      <span className="lv3-m">
        <b>{session.title}</b>
        <small>
          <i className="lv3-dot" aria-hidden="true"></i>Live · free · with a{' '}
          {expertName(session.expert)}
        </small>
      </span>
      <button
        className="mp-seat"
        data-a="remind"
        aria-label={`Remind me: ${session.title}`}
        onClick={remindMe}
      >
        <span aria-hidden="true">🔔</span> Remind me
      </button>
    </div>
  )
}

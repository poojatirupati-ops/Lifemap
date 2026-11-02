import type { CSSProperties, ReactNode } from 'react'
import type { LiveSession } from '../../content/cms.tsx'
import { expertName } from './explore.data.ts'
import { remindMe } from '../../state/explore.ts'

interface Props {
  session: Pick<LiveSession, 'when' | 'title'> & Partial<LiveSession>
  /** The line after "Live · free · "; by default who runs it. */
  who?: ReactNode
  style?: CSSProperties
  /** The button on the right; by default "Remind me". */
  children?: ReactNode
}

/** A free live session with an expert, and a button: "Remind me" unless another is given. */
export default function LiveCard({ session, who, style, children }: Props) {
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
          <i className="lv3-dot" aria-hidden="true"></i>Live · free ·{' '}
          {who ?? (session.expert ? `with a ${expertName(session.expert)}` : null)}
        </small>
      </span>
      {children ?? (
        <button
          className="mp-seat"
          data-a="remind"
          aria-label={`Remind me: ${session.title}`}
          onClick={remindMe}
        >
          <span aria-hidden="true">🔔</span> Remind me
        </button>
      )}
    </div>
  )
}

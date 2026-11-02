import LiveCard from '../explore/LiveCard.tsx'
import { useLiveSessions } from '../../content/cms.tsx'

const SPACED = { marginBottom: 8 }

/** "What's on": every live session with an expert. */
export default function LiveSessions() {
  const sessions = useLiveSessions()
  return (
    <>
      <div className="sec">
        <h3>What's on · live with experts</h3>
      </div>
      {sessions.map((session) => (
        <LiveCard key={session.title} session={session} style={SPACED} />
      ))}
    </>
  )
}

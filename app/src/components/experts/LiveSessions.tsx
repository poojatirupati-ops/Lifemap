import LiveCard from '../explore/LiveCard.tsx'
import { LIVE_SESSIONS } from '../explore/explore.data.ts'

const SPACED = { marginBottom: 8 }

/** "What's on": every live session with an expert. */
export default function LiveSessions() {
  return (
    <>
      <div className="sec">
        <h3>What's on · live with experts</h3>
      </div>
      {LIVE_SESSIONS.map((session) => (
        <LiveCard key={session.title} session={session} style={SPACED} />
      ))}
    </>
  )
}

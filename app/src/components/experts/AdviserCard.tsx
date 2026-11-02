import type { Adviser } from '../../domain/identity/advisers.data.ts'
import { EXPERTS } from '../../domain/identity/advisers.data.ts'
import type { Specialist } from '../../domain/identity/booking.ts'

function matchReason(specialist: Specialist) {
  const title = EXPERTS[specialist.kind].title.toLowerCase()
  if (specialist.picked)
    return (
      <>
        You chose a <b>{title}</b>.
      </>
    )
  if (specialist.goal)
    return (
      <>
        Matched because <b>{specialist.goal.name.toLowerCase()}</b> is where you could gain most.
      </>
    )
  return <>A financial planner looks at your whole picture.</>
}

/** The matched sample adviser: initials, who they are, how they meet and why they match. */
export default function AdviserCard({
  adviser,
  specialist,
}: {
  adviser: Adviser
  specialist: Specialist
}) {
  return (
    <div className="card adv2">
      <div className="av2-top">
        <span className="av2-face" aria-hidden="true">
          {adviser.initials}
          <i className="av2-on"></i>
        </span>
        <div className="av2-id">
          <span className="av2-tag">Your match · sample adviser</span>
          <b>{adviser.name}</b>
          <span>
            {EXPERTS[specialist.kind].title} · {adviser.qualifications}
          </span>
        </div>
      </div>
      <div className="av2-chips">
        <span>🗣️ {adviser.languages}</span>
        <span>📍 {adviser.location}</span>
        <span>💻 {adviser.meetingMode}</span>
      </div>
      <p className="av2-why">
        <span aria-hidden="true">✨</span>
        {matchReason(specialist)}
      </p>
    </div>
  )
}

import { personality } from '../../domain/discovery/profile.ts'
import { useProfileAnswers } from '../../hooks/useProfileAnswers.ts'

/** What Save your results keeps: the personality and the answers (nothing before four answers). */
export default function SavedPersonality() {
  const type = personality(useProfileAnswers())
  if (!type) return null
  return (
    <div className="ds-keep">
      <span className="ds-ke" aria-hidden="true">
        {type.emoji}
      </span>
      <span className="ds-kt">
        <small>We'll save</small>
        <b>{type.name} · your 6 answers</b>
      </span>
      <span className="ds-ok" aria-hidden="true">
        ✓
      </span>
    </div>
  )
}

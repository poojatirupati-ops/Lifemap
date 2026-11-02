import { isPrefilled, type ProfileQuestion } from '../../domain/discovery/profileQuestions.ts'
import { useStore } from '../../state/store.ts'
import PrefilledAnswer from './PrefilledAnswer.tsx'

/** The Discover answers a section already has, each with Edit (which opens its options). */
export default function PrefilledAnswers({ entries }: { entries: ProfileQuestion[] }) {
  const answers = useStore((store) => store.plan.answers)
  const answered = entries.filter((entry) => isPrefilled(entry, answers))
  if (!answered.length) return null

  return (
    <>
      <p className="fa-note">
        <span aria-hidden="true">✓</span> Pre-filled from your first answers · tap Edit to change
        one
      </p>
      <div className="fa-list">
        {answered.map((entry, index) => (
          <PrefilledAnswer key={entry.question.id} entry={entry} index={index} />
        ))}
      </div>
    </>
  )
}

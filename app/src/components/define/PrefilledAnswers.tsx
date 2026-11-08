import {
  editKey,
  isPrefilled,
  type ProfileQuestion,
} from '../../domain/discovery/profileQuestions.ts'
import { useStore } from '../../state/store.ts'
import GIcon from '../ui/GIcon.tsx'
import ProfileOption from './ProfileOption.tsx'
import { editProfileAnswer, pickProfileAnswer } from '../../state/profile.ts'

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

interface Props {
  entry: ProfileQuestion
  index: number
}

/** One pre-filled Discover answer: the chosen option with Edit, or, while editing, all options. */
function PrefilledAnswer({ entry, index }: Props) {
  const { question } = entry
  const key = editKey(entry)
  const answer = useStore((store) => store.plan.answers[question.id])
  const editing = useStore((store) => Boolean(store.editingAnswers[key]))
  const chosen = question.options[answer]

  return (
    <div className={editing ? 'pq fa-c fa-ed' : 'pq fa-c'}>
      <div className="fa-q">
        <span className="fa-n">{index + 1}</span>
        {question.title}
      </div>
      {editing ? (
        <div className="opts" role="group" aria-label={question.title}>
          {question.options.map((option, i) => (
            <ProfileOption
              key={i}
              option={option}
              selected={answer === i}
              code={`${key}|${i}`}
              onPick={() => pickProfileAnswer(entry, i)}
            />
          ))}
        </div>
      ) : (
        <div className="fa-a">
          <GIcon emoji={chosen.emoji} className="fa-e" aria-hidden="true" />
          <b>{chosen.text}</b>
          <button
            className="fa-edit"
            data-a="umedit"
            data-p={key}
            aria-label={`Edit your answer to: ${question.title}`}
            onClick={() => editProfileAnswer(entry)}
          >
            Edit
          </button>
        </div>
      )}
    </div>
  )
}

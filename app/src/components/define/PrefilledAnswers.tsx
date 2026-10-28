import { useStore } from '../../state/store.ts'
import GIcon from '../ui/GIcon.tsx'
import ProfileOption from './ProfileOption.tsx'
import {
  editKey,
  editProfileAnswer,
  pickProfileAnswer,
  type ProfileQuestion,
} from './profileActions.ts'

/** The Discover answers a section already has, each with Edit (which opens its options). */
export default function PrefilledAnswers({ entries }: { entries: ProfileQuestion[] }) {
  const discoverAnswers = useStore((store) => store.plan.ans)
  const editing = useStore((store) => store.plan.meEdit)
  const answered = entries.filter(
    (entry) => entry.discover && discoverAnswers[entry.question.id] != null,
  )
  if (!answered.length) return null

  return (
    <>
      <p className="fa-note">
        <span aria-hidden="true">✓</span> Pre-filled from your first answers · tap Edit to change
        one
      </p>
      <div className="fa-list">
        {answered.map((entry, index) => {
          const { question } = entry
          const answer = discoverAnswers[question.id]
          const heading = (
            <div className="fa-q">
              <span className="fa-n">{index + 1}</span>
              {question.title}
            </div>
          )
          if (editing[editKey(entry)]) {
            return (
              <div key={question.id} className="pq fa-c fa-ed">
                {heading}
                <div className="opts" role="group" aria-label={question.title}>
                  {question.options.map((option, i) => (
                    <ProfileOption
                      key={i}
                      option={option}
                      selected={answer === i}
                      code={`${editKey(entry)}|${i}`}
                      onPick={() => pickProfileAnswer(entry, i)}
                    />
                  ))}
                </div>
              </div>
            )
          }
          const chosen = question.options[answer]
          return (
            <div key={question.id} className="pq fa-c">
              {heading}
              <div className="fa-a">
                <GIcon emoji={chosen.emoji} className="fa-e" aria-hidden="true" />
                <b>{chosen.text}</b>
                <button
                  className="fa-edit"
                  data-a="umedit"
                  data-p={editKey(entry)}
                  aria-label={`Change your answer to: ${question.title}`}
                  onClick={() => editProfileAnswer(entry)}
                >
                  Edit
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

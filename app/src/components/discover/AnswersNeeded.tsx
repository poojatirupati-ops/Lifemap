import clsx from 'clsx'
import { DISCOVER_SIX } from '../../domain/discovery/questions.data.ts'
import { PERSONALITY_TYPES } from '../../domain/identity/personality.data.ts'
import { useStore } from '../../state/store.ts'
import ColumnFoot from './ColumnFoot.tsx'
import ProgressRing from './ProgressRing.tsx'

const NEEDED = 4
const TOTAL = DISCOVER_SIX.length

/** Fewer than four answers: no personality yet, a ring of progress and the questions left. */
export default function AnswersNeeded() {
  const answers = useStore((store) => store.plan.answers)
  const showQuestion = useStore((store) => store.showQuestion)
  const backFromReveal = useStore((store) => store.backFromReveal)
  const finishOnboarding = useStore((store) => store.finishOnboarding)
  const answered = DISCOVER_SIX.map((q) => answers[q.id] != null)
  const count = answered.filter(Boolean).length
  const firstOpen = answered.indexOf(false)

  return (
    <>
      <div className="qtop">
        <button className="qx" aria-label="Back to the questions" onClick={backFromReveal}>
          ‹
        </button>
        <span className="dn-title">Your money personality</span>
        <span style={{ width: 44 }} />
      </div>
      <div className="qbody dnot">
        <ProgressRing count={count} total={TOTAL} marker={NEEDED} />
        <h2 tabIndex={-1}>Just {NEEDED - count} more to go</h2>
        <p className="qsub">Under a minute to unlock your result.</p>
        <div className="dn-dots" role="group" aria-label="Questions">
          {answered.map((done, i) => (
            <button
              key={i}
              className={clsx('dn-dot', { ok: done })}
              aria-label={`Question ${i + 1}, ${done ? 'answered' : 'not answered yet'}`}
              onClick={() => showQuestion(i)}
            >
              {done ? '✓' : i + 1}
            </button>
          ))}
        </div>
        <div className="dn-tease" aria-hidden="true">
          <span>
            {Object.values(PERSONALITY_TYPES).map((type) => (
              <i key={type.name}>{type.emoji}</i>
            ))}
          </span>
          Which one are you?
        </div>
      </div>
      <ColumnFoot>
        <button className="wbtn" onClick={() => showQuestion(firstOpen)}>
          Answer a few more
        </button>
        <button className="qback" onClick={finishOnboarding}>
          Skip for now
        </button>
      </ColumnFoot>
    </>
  )
}

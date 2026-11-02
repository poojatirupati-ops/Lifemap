import clsx from 'clsx'
import { MIN_DISCOVER_ANSWERS } from '../../domain/discovery/profile.ts'
import { DISCOVER_SIX } from '../../domain/discovery/questions.data.ts'
import { PERSONALITY_TYPES } from '../../domain/identity/personality.data.ts'
import { useStore } from '../../state/store.ts'
import ColumnFoot from './ColumnFoot.tsx'

const TOTAL = DISCOVER_SIX.length
const RADIUS = 52
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
// the dot on the ring: the count that unlocks the result
const MARKER_ANGLE = (2 * Math.PI * MIN_DISCOVER_ANSWERS) / TOTAL

/** Too few answers: no personality yet, a ring of progress and the questions left. */
export default function AnswersNeeded() {
  const answers = useStore((store) => store.plan.answers)
  const { showQuestion, backFromReveal, finishOnboarding } = useStore.getState()
  const answered = DISCOVER_SIX.map((q) => answers[q.id] != null)
  const count = answered.filter(Boolean).length

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
        <div className="dn-ring" aria-hidden="true">
          <svg width="132" height="132" viewBox="0 0 132 132">
            <defs>
              <linearGradient id="dng" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#08D9B8" />
                <stop offset="1" stopColor="#0B5880" />
              </linearGradient>
            </defs>
            <circle
              cx="66"
              cy="66"
              r={RADIUS}
              fill="none"
              stroke="rgba(8,106,116,.1)"
              strokeWidth="10"
            />
            <circle
              cx="66"
              cy="66"
              r={RADIUS}
              fill="none"
              stroke="url(#dng)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE * (1 - count / TOTAL)}
              transform="rotate(-90 66 66)"
              className="dn-arc"
            />
            <circle
              cx={66 + RADIUS * Math.sin(MARKER_ANGLE)}
              cy={66 - RADIUS * Math.cos(MARKER_ANGLE)}
              r="5"
              fill="#fff"
              stroke="#079E98"
              strokeWidth="2.5"
            />
          </svg>
          <span>
            <b>
              {count}
              <small>/{TOTAL}</small>
            </b>
            <em>answered</em>
          </span>
        </div>
        <h2 tabIndex={-1}>Just {MIN_DISCOVER_ANSWERS - count} more to go</h2>
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
        <button className="wbtn" onClick={() => showQuestion(answered.indexOf(false))}>
          Answer a few more
        </button>
        <button className="qback" onClick={finishOnboarding}>
          Skip for now
        </button>
      </ColumnFoot>
    </>
  )
}

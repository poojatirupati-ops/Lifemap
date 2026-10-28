import type { CSSProperties } from 'react'
import { DISCOVER_SIX } from '../../domain/discovery/questions.data.ts'
import { PERSONALITY_TYPES } from '../../domain/identity/personality.data.ts'
import { useStore } from '../../state/store.ts'
import { backFromReveal, showQuestion } from './discoverActions.ts'

const RADIUS = 52
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const NEEDED = 4
const TOTAL = DISCOVER_SIX.length
const markerAngle = (2 * Math.PI * NEEDED) / TOTAL
const columnFoot: CSSProperties = { flexDirection: 'column', alignItems: 'stretch', gap: 6 }

/** Fewer than four answers: no personality yet, a ring of progress and the questions left. */
export default function AnswersNeeded() {
  const answers = useStore((store) => store.plan.ans)
  const answered = DISCOVER_SIX.map((q) => answers[q.id] != null)
  const count = answered.filter(Boolean).length
  const firstOpen = answered.indexOf(false)

  return (
    <>
      <div className="qtop">
        <button
          className="qx"
          data-a="dprev"
          aria-label="Back to the questions"
          onClick={backFromReveal}
        >
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
              cx={66 + RADIUS * Math.sin(markerAngle)}
              cy={66 - RADIUS * Math.cos(markerAngle)}
              r="5"
              fill="#fff"
              stroke="#079E98"
              strokeWidth="2.5"
            />
          </svg>
          <span>
            <b>
              {count}
              <small>/6</small>
            </b>
            <em>answered</em>
          </span>
        </div>
        <h2 tabIndex={-1}>Just {NEEDED - count} more to go</h2>
        <p className="qsub">Under a minute to unlock your result.</p>
        <div className="dn-dots" role="group" aria-label="Questions">
          {answered.map((done, i) => (
            <button
              key={i}
              className={done ? 'dn-dot ok' : 'dn-dot'}
              data-a="dgoto"
              data-p={i}
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
      <div className="qfoot" style={columnFoot}>
        <button
          className="wbtn"
          data-a="dgoto"
          data-p={firstOpen}
          onClick={() => showQuestion(firstOpen)}
        >
          Answer a few more
        </button>
        <button
          className="qback"
          data-a="go"
          data-p="DS"
          onClick={() => useStore.getState().go('DS')}
        >
          Skip for now
        </button>
      </div>
    </>
  )
}

import clsx from 'clsx'
import { useStore } from '../state/store.ts'

export const key = 'D1'
export const id = 'D1'
export const note =
  'Optional, multi-select life-moment chips (MASTER B5; Pooja 1 Oct). They quietly reorder the suggested goal tiles. One skippable screen.'
export const kind = 'quiz'

/** What brought the customer here; the keys are stored in plan.why. */
const REASONS = [
  { key: 'track', emoji: '🧭', title: 'Where I stand' },
  { key: 'home', emoji: '🏡', title: 'Home & mortgage' },
  { key: 'safety', emoji: '🛟', title: 'Emergency fund' },
  { key: 'retire', emoji: '🌅', title: 'Retirement plan' },
  { key: 'goal', emoji: '🎯', title: 'Save for something' },
  { key: 'invest', emoji: '📈', title: 'Invest my money' },
  { key: 'debt', emoji: '💳', title: 'Clear my debt' },
  { key: 'change', emoji: '🔄', title: 'Big life change' },
  { key: 'curious', emoji: '👀', title: 'Just exploring' },
]

const QUESTION = 'What brings you to LifeMap?'

// TODO(Q-01): rename plan.why to plan.reasons and plan.di to plan.discoveryStep.

export function Body() {
  const chosen = useStore((store) => store.plan.why)
  const go = useStore((store) => store.go)
  const toggleReason = useStore((store) => store.toggleReason)
  const showQuestion = useStore((store) => store.showQuestion)
  const startDiscovery = () => showQuestion(0)

  return (
    <>
      <div className="qtop">
        <button className="qx" aria-label="Back" onClick={() => go('D0')}>
          ‹
        </button>
        <span style={{ flex: 1 }} />
      </div>
      <div className="qbody">
        <div className="qeye">Before we start</div>
        <h2 tabIndex={-1}>{QUESTION}</h2>
        <p className="qsub">
          Choose one or more goals that fit you. We'll build your plan around them.
        </p>
        <div className="chips wgrid" role="group" aria-label={QUESTION}>
          {REASONS.map(({ key, emoji, title }) => {
            const selected = chosen.includes(key)
            return (
              <button
                key={key}
                className={clsx('chip wtile', { sel: selected })}
                aria-pressed={selected}
                onClick={() => toggleReason(key)}
              >
                <span className="wem" aria-hidden="true">
                  {emoji}
                </span>
                <span className="wtx">{title}</span>
              </button>
            )
          })}
        </div>
      </div>
      <div className="qfoot">
        <button className="qback" onClick={startDiscovery}>
          Skip for now
        </button>
        <button className="wbtn" disabled={chosen.length === 0} onClick={startDiscovery}>
          Continue
        </button>
      </div>
    </>
  )
}

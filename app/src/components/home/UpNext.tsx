import type { NextAction, NextStep } from '../../domain/planning/nextStep.ts'
import { useStore } from '../../state/store.ts'

type Button = {
  /** the original's data-a / data-p, kept so the DOM matches */
  a: string
  p?: (target?: number) => string | number | undefined
  open: (target?: number) => void
}

const BUTTONS: Record<NextAction, Button> = {
  looks: { a: 'me', p: () => 'money', open: () => useStore.getState().openMe('money') },
  foundation: {
    a: 'sheet',
    p: (index) => `fnd|${index}`,
    open: (index = 0) => useStore.getState().openFoundation(index),
  },
  profile: { a: 'toprofile', open: () => useStore.getState().openProfile() },
  whatIf: {
    a: 'gowi',
    p: (goalId) => goalId,
    open: (goalId) => useStore.getState().tryWhatIf(goalId),
  },
  book: { a: 'book', open: () => useStore.getState().bookAdviser() },
  meeting: { a: 'tab', p: () => 'exp', open: () => useStore.getState().switchTab('exp') },
}

/** "Your next best step" card. */
export default function UpNext({ step }: { step: NextStep }) {
  const button = BUTTONS[step.action]
  return (
    <div className="card upnext">
      <div className="un-img" aria-hidden="true"></div>
      <div className="un-body">
        <div className="eyebrow">Your next best step</div>
        <div className="row" style={{ marginTop: 6, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 26 }} aria-hidden="true">
            {step.emoji}
          </span>
          <div style={{ flex: 1 }}>
            <b style={{ fontSize: 16 }}>{step.title}</b>
            <div className="small" style={{ color: 'var(--ink)' }}>
              {step.detail}
            </div>
          </div>
        </div>
        <button
          className="btn sm"
          style={{ width: '100%', marginTop: 12 }}
          data-a={button.a}
          data-p={button.p?.(step.target)}
          onClick={() => button.open(step.target)}
        >
          {step.button}
        </button>
      </div>
    </div>
  )
}

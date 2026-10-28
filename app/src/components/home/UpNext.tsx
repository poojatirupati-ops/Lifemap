import { useStore } from '../../state/store.ts'
import { bookAdviser, openMe, openProfile } from '../plan/planActions.ts'
import { openFoundation, tryWhatIf } from './homeActions.ts'
import type { NextAction, NextStep } from './nextStep.ts'

const ACTIONS: Record<NextAction, (target?: number) => void> = {
  looks: () => openMe('money'),
  foundation: (index) => openFoundation(index!),
  profile: openProfile,
  whatIf: tryWhatIf,
  book: bookAdviser,
  meeting: () => useStore.getState().switchTab('exp'),
}

// the original's button names, kept so the DOM matches
const DATA_A: Record<NextAction, [string, string?]> = {
  looks: ['me', 'money'],
  foundation: ['sheet'],
  profile: ['toprofile'],
  whatIf: ['gowi'],
  book: ['book'],
  meeting: ['tab', 'exp'],
}

/** "Your next best step" card. */
export default function UpNext({ step }: { step: NextStep }) {
  const [a, p] = DATA_A[step.action]
  const param = step.action === 'foundation' ? `fnd|${step.target}` : (p ?? step.target)
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
          data-a={a}
          data-p={param}
          onClick={() => ACTIONS[step.action](step.target)}
        >
          {step.button}
        </button>
      </div>
    </div>
  )
}

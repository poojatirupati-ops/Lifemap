import { useRef, useState } from 'react'
import { useStore } from '../state/store.ts'
import SavedPersonality from '../components/discover/SavedPersonality.tsx'
import { isEmail, saveResults, skipSaving } from '../components/discover/discoverActions.ts'

export const key = 'DS'
export const id = 'DS'
export const note =
  'Save your results (§12, MASTER C8): email only, or Skip for now. No password, no money yet. Then straight into the main app.'
export const kind = 'quiz'

const TRUST = [
  ['🔗', 'No password'],
  ['🇪🇺', 'Stored in the EU'],
  ['🔒', 'Never sold'],
]

export function Body() {
  const savedEmail = useStore(({ plan }) => plan.save.email || plan.acct.email)
  const comms = useStore(({ plan }) => plan.save.comms)
  const emailInput = useRef<HTMLInputElement>(null)
  const commsInput = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')

  const save = () => {
    const email = emailInput.current!.value.trim()
    if (!isEmail(email)) setError('Please enter a valid email, or tap Skip for now.')
    else saveResults(email, commsInput.current!.checked)
  }

  return (
    <>
      <div className="qtop">
        <button
          className="qx"
          data-a="go"
          data-p="DR"
          aria-label="Back"
          onClick={() => useStore.getState().go('DR')}
        >
          ‹
        </button>
        <span style={{ flex: 1 }} />
      </div>
      <div className="qbody">
        <div className="medal msave" aria-hidden="true">
          <svg
            className="msvg"
            width="46"
            height="46"
            viewBox="0 0 48 48"
            fill="none"
            stroke="#fff"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path
              d="M14 36h20.5a8.5 8.5 0 0 0 1.4-16.9A12 12 0 0 0 13 21.5 7.3 7.3 0 0 0 14 36z"
              fill="rgba(255,255,255,.18)"
            />
            <path d="m18.5 27.5 4 4 8-8.5" />
          </svg>
        </div>
        <h2 tabIndex={-1}>Save your results</h2>
        <p className="qsub">Sign in with this email later to pick up where you left off.</p>
        <SavedPersonality />
        <div className="ds-card">
          <div className="field">
            <label htmlFor="ds-email">Email</label>
            <div className="ds-in">
              <span aria-hidden="true">✉️</span>
              <input
                ref={emailInput}
                className="in"
                id="ds-email"
                placeholder="you@example.com"
                type="email"
                autoComplete="email"
                defaultValue={savedEmail}
              />
            </div>
            <p
              id="dserr"
              className="small"
              style={{ color: 'var(--gap-t)', margin: 0, minHeight: 4 }}
              role="alert"
            >
              {error}
            </p>
          </div>
          <label className="check">
            <input ref={commsInput} type="checkbox" id="ds-comms" defaultChecked={comms} />
            <span>
              Send me tips and reminders <em>(optional)</em>
            </span>
          </label>
        </div>
        <div className="ds-trust">
          {TRUST.map(([icon, text]) => (
            <span key={text}>
              <i aria-hidden="true">{icon}</i>
              {text}
            </span>
          ))}
        </div>
      </div>
      <div className="qfoot ds-foot">
        <button className="wbtn" data-a="dssave" onClick={save}>
          Save my results
        </button>
        <button className="qback" data-a="dsskip" onClick={skipSaving}>
          Skip for now
        </button>
      </div>
    </>
  )
}

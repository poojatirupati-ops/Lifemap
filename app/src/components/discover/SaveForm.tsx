import { useForm } from 'react-hook-form'
import { looksLikeEmail } from '../../domain/identity/signIn.ts'
import { useStore } from '../../state/store.ts'
import SavedPersonality from './SavedPersonality.tsx'

const TRUST = [
  ['🔗', 'No password'],
  ['🇪🇺', 'Stored in the EU'],
  ['🔒', 'Never sold'],
]

const intro = (
  <>
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
    <p className="qsub">We'll email you a secure link so you can pick up where you left off.</p>
    <SavedPersonality />
  </>
)

/** The intro, email, optional tips and the trust line; the foot saves or skips. */
export default function SaveForm() {
  const savedEmail = useStore(({ plan }) => plan.save.email || plan.account.email)
  const comms = useStore(({ plan }) => plan.save.comms)
  const saveResults = useStore((store) => store.saveResults)
  const skipSaving = useStore((store) => store.skipSaving)
  const { register, handleSubmit, formState } = useForm({
    defaultValues: { email: savedEmail, comms },
    reValidateMode: 'onSubmit',
  })
  const save = handleSubmit(({ email, comms }) => saveResults(email.trim(), comms))

  return (
    <>
      <div className="qbody">
        {intro}
        <div className="ds-card">
          <div className="field">
            <label htmlFor="ds-email">Email</label>
            <div className="ds-in">
              <span aria-hidden="true">✉️</span>
              <input
                {...register('email', {
                  validate: (email) =>
                    looksLikeEmail(email.trim()) ||
                    'Please enter a valid email, or tap Skip for now.',
                })}
                className="in"
                id="ds-email"
                placeholder="you@example.com"
                type="email"
                autoComplete="email"
              />
            </div>
            <p
              id="dserr"
              className="small"
              style={{ color: 'var(--gap-t)', margin: 0, minHeight: 4 }}
              role="alert"
            >
              {formState.errors.email?.message}
            </p>
          </div>
          <label className="check">
            <input {...register('comms')} type="checkbox" id="ds-comms" />
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
        <button className="wbtn" onClick={save}>
          Save my results
        </button>
        <button className="qback" onClick={skipSaving}>
          Skip for now
        </button>
      </div>
    </>
  )
}

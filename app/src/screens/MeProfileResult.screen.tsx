import { useStore } from '../state/store.ts'
import { meHead } from '../components/me/meHead.ts'
import ProfileReturn from '../components/me/ProfileReturn.tsx'
import RiskBar from '../components/me/RiskBar.tsx'
import TermsList from '../components/me/TermsList.tsx'
import { useProfileRead } from '../components/me/useProfileRead.ts'
import { useProfileAnswers } from '../hooks/useProfileAnswers.ts'
import { moneyTerms } from '../domain/discovery/moneyTerms.ts'
import { EXPERIENCE_NOTE, RISK_SET_BY } from '../domain/discovery/profile.data.ts'
import { riskLabelText } from '../domain/discovery/riskRead.ts'
import { DISCOVERY_DISCLAIMER } from '../domain/identity/personality.data.ts'

export const key = 'ME:umr'
export const id = 'ME-R'
export const note =
  'Understand Me result: money personality + indicative risk profile (5 labels, lowest of want, can afford, time and experience; FP review R2–R6). Feeds My Plan. Adviser confirms.'

export const Head = () =>
  meHead({ title: 'Your profile', back: () => useStore.getState().openMe('um') })

export function Body() {
  const { type, read } = useProfileRead(true)
  const terms = moneyTerms(useProfileAnswers())

  return (
    <>
      {type && (
        <div className="card rp-hero">
          <div className="rp-top">
            <span className="rp-e" aria-hidden="true">
              {type.emoji}
            </span>
            <div>
              <small>Your money personality</small>
              <b>{type.name}</b>
            </div>
          </div>
          <p className="rp-strap">{type.strapline}</p>
          <div className="rp-str">
            {type.strengths.map((strength) => (
              <span key={strength}>
                <i aria-hidden="true">✓</i>
                {strength}
              </span>
            ))}
          </div>
          <div className="rp-watch">
            <span aria-hidden="true">👀</span>
            <div>
              <small>One thing to watch</small>
              {type.watchOut}
            </div>
          </div>
        </div>
      )}
      <div className="card rp-terms">
        <h3 className="h">Your money terms</h3>
        <TermsList terms={terms} />
      </div>
      <div className="card rp-risk">
        <small className="rp-lbl">Your indicative risk profile</small>
        <div className="rp-rl">{riskLabelText(read)}</div>
        {read.label && (
          <>
            <RiskBar section="appetite" level={read.willingness} />
            <RiskBar section="capacity" level={read.capacity} />
            <RiskBar section="horizon" level={read.horizon} />
            {read.limitedBy === 'experience' && <RiskBar section="experience" level={read.level} />}
            <p className="small" style={{ margin: '8px 0 0' }}>
              Set by: <b>{RISK_SET_BY[read.limitedBy!]}</b>
            </p>
            {read.experienceNote && (
              <p className="small" style={{ margin: '6px 0 0', color: 'var(--ink)' }}>
                {EXPERIENCE_NOTE}
              </p>
            )}
          </>
        )}
        {read.mismatch && (
          <p className="note" style={{ marginTop: 12 }}>
            {read.mismatch}
          </p>
        )}
        <p className="small" style={{ margin: '10px 0 0' }}>
          This now shows on <b>My Plan</b> and in your plan report.
        </p>
      </div>
      <ProfileReturn />
      <p className="disc">
        This is an indicative profile to guide your conversation. It is not advice. Your adviser
        confirms your risk profile with you. {DISCOVERY_DISCLAIMER}
      </p>
    </>
  )
}

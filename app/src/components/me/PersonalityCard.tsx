import { hasEnoughForPersonality } from '../../domain/discovery/profile.ts'
import { riskLabelText } from '../../domain/discovery/riskRead.ts'
import { openMe } from '../plan/planActions.ts'
import { PROFILE_QUESTIONS } from './mePlan.ts'
import { useProfileRead } from './useProfileRead.ts'

/** The hub's money personality and indicative risk profile, or a prompt to answer more first. */
export default function PersonalityCard() {
  const { answers, type, read, answered, complete } = useProfileRead()

  if (!hasEnoughForPersonality(answers.discover) || !type)
    return (
      <div className="card">
        <div className="eyebrow">Your profile</div>
        <p className="small" style={{ color: 'var(--ink)', margin: '6px 0 0' }}>
          Answer a few more of your first questions to see your money personality and indicative
          risk profile.
        </p>
        <button className="link" data-a="me" data-p="recheck" onClick={() => openMe('recheck')}>
          Answer a few more
        </button>
      </div>
    )

  const next = complete ? 'umr' : 'um'
  return (
    <div className="card mepr">
      <div className="mepr-top">
        <span className="mepr-e" aria-hidden="true">
          {type.emoji}
        </span>
        <div>
          <small>Your money personality</small>
          <b>{type.name}</b>
          <span>{type.strapline}</span>
        </div>
      </div>
      <div className="mepr-risk">
        <div className="mepr-rl">
          <small>Indicative risk profile</small>
          <b>{riskLabelText(read).replace(/\s*\(first read\)/i, '')}</b>
        </div>
        <div className="mepr-meter" aria-label={`${answered} of 13 answers`}>
          <span>
            <i style={{ width: `${Math.round((answered / PROFILE_QUESTIONS) * 100)}%` }}></i>
          </span>
          <small>
            {complete ? 'Confirmed · all 13 answers' : `${answered} of 13 answers · first read`}
          </small>
        </div>
      </div>
      <button className="mepr-cta" data-a="me" data-p={next} onClick={() => openMe(next)}>
        {complete
          ? 'See my full profile'
          : `Answer ${PROFILE_QUESTIONS - answered} more to confirm`}{' '}
        <i aria-hidden="true">→</i>
      </button>
    </div>
  )
}

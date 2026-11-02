import { useStore } from '../../state/store.ts'
import { PROFILE_QUESTIONS, profilePercent } from '../../domain/discovery/profile.ts'
import { riskLabelText } from '../../domain/discovery/riskRead.ts'
import { useProfileRead } from './useProfileRead.ts'

/** The hub's money personality and indicative risk profile, or a prompt to answer more first. */
export default function PersonalityCard() {
  const { type, read, answered, complete } = useProfileRead()
  const percent = useStore(({ plan }) => profilePercent(plan))
  const openMe = useStore((store) => store.openMe)

  if (!type)
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
          <b>{riskLabelText({ ...read, provisional: false })}</b>
        </div>
        <div className="mepr-meter" aria-label={`${answered} of ${PROFILE_QUESTIONS} answers`}>
          <span>
            <i style={{ width: `${percent}%` }}></i>
          </span>
          <small>
            {complete
              ? `Confirmed · all ${PROFILE_QUESTIONS} answers`
              : `${answered} of ${PROFILE_QUESTIONS} answers · first read`}
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

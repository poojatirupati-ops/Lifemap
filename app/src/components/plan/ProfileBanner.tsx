import { cushion } from '../../domain/discovery/cushion.ts'
import {
  hasEnoughForPersonality,
  moneyProfileAnswered,
  suggestedHorizon,
} from '../../domain/discovery/profile.ts'
import { riskRead } from '../../domain/discovery/riskRead.ts'
import type { Plan } from '../../state/types.ts'
import { useProfileAnswers } from '../discover/useProfileAnswers.ts'
import { openMe, openProfile } from './planActions.ts'

/** The risk profile as it reads now, with a way to finish or view it in Me. */
export default function ProfileBanner({ plan }: { plan: Plan }) {
  const answers = useProfileAnswers()
  if (!hasEnoughForPersonality(answers.discover))
    return (
      <div className="banner" id="r-prof">
        <span aria-hidden="true">🧭</span>
        <span>
          <b>Risk profile: not enough answers yet</b>
        </span>
        <button className="link" data-a="me" data-p="recheck" onClick={() => openMe('recheck')}>
          Answer in Me
        </button>
      </div>
    )

  const complete = moneyProfileAnswered(answers) === 13
  const read = riskRead(answers, {
    complete,
    cushion: cushion(plan),
    suggestedHorizon: suggestedHorizon(plan.goals, plan.about.age ?? 0, plan.retireAge),
  })
  return (
    <div className="banner" id="r-prof">
      <span aria-hidden="true">🧭</span>
      <span>
        <b>
          Risk profile{read.provisional && read.label ? ' (first read)' : ''}:{' '}
          {read.label || 'Not answered yet'}
        </b>{' '}
        <span className="small">
          · {complete ? 'from your profile in Me' : 'Finish in Me to confirm'}
        </span>
      </span>
      <button className="link" data-a="toprofile" onClick={openProfile}>
        {complete ? 'View' : 'Finish in Me'}
      </button>
    </div>
  )
}

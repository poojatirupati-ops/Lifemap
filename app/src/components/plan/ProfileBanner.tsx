import { cushion, type CushionInputs } from '../../domain/discovery/cushion.ts'
import {
  hasEnoughForPersonality,
  isProfileComplete,
  suggestedHorizon,
} from '../../domain/discovery/profile.ts'
import { riskRead } from '../../domain/discovery/riskRead.ts'
import type { Plan } from '../../state/types.ts'
import { useProfileAnswers } from '../../hooks/useProfileAnswers.ts'
import { useStore } from '../../state/store.ts'

/** The risk profile as it reads now, with a way to finish or view it in Me. */
export default function ProfileBanner({ inputs }: { inputs: CushionInputs & Pick<Plan, 'goals'> }) {
  const answers = useProfileAnswers()
  const openMe = useStore((store) => store.openMe)
  const openProfile = useStore((store) => store.openProfile)
  const complete = useStore((store) => isProfileComplete(store.plan))
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

  const read = riskRead(answers, {
    complete,
    cushion: cushion(inputs),
    suggestedHorizon: suggestedHorizon(inputs.goals, inputs.about.age ?? 0, inputs.retireAge),
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

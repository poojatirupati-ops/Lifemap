import { useStore } from '../../state/store.ts'
import { cushion } from '../../domain/discovery/cushion.ts'
import { personality, suggestedHorizon } from '../../domain/discovery/profile.ts'
import { riskRead } from '../../domain/discovery/riskRead.ts'
import { useProfileAnswers } from '../discover/useProfileAnswers.ts'
import { PROFILE_QUESTIONS, profileAnswered } from './mePlan.ts'

/** The money personality and risk read; confirmed once all 13 questions are answered (or `confirmed`). */
export function useProfileRead(confirmed = false) {
  const answers = useProfileAnswers()
  const plan = useStore((store) => store.plan)
  const answered = profileAnswered(plan)
  const complete = answered === PROFILE_QUESTIONS
  const read = riskRead(answers, {
    complete: confirmed || complete,
    cushion: cushion(plan),
    suggestedHorizon: suggestedHorizon(plan.goals, plan.about.age ?? 0, plan.retireAge),
  })
  return { answers, type: personality(answers), read, answered, complete }
}

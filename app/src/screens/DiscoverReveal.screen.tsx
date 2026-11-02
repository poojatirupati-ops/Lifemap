import { hasEnoughForPersonality, personality } from '../domain/discovery/profile.ts'
import { useProfileAnswers } from '../hooks/useProfileAnswers.ts'
import type { Plan } from '../state/types.ts'
import AnswersNeeded from '../components/discover/AnswersNeeded.tsx'
import PersonalityReveal from '../components/discover/PersonalityReveal.tsx'

export const key = 'DR'
export const id = 'DR'
export const note = (plan: Plan) =>
  hasEnoughForPersonality(plan.answers)
    ? "Money-personality reveal (§12): type + the customer's own financial / behavioural terms with a plain meaning + risk appetite and cushion in words and terms + at most one hint (S1 K13–K17). CTA: make my plan."
    : 'Money personality needs at least 4 of the 6 Discover answers (CJ E10: no result from no answers).'
export const kind = 'quiz'

export function Body() {
  const type = personality(useProfileAnswers())
  return type ? <PersonalityReveal type={type} /> : <AnswersNeeded />
}

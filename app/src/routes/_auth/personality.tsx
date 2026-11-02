import { hasEnoughForPersonality, personality } from '../../domain/discovery/profile.ts'
import { useProfileAnswers } from '../../hooks/useProfileAnswers.ts'
import { createFileRoute } from '@tanstack/react-router'
import Screen from '../../shell/Screen.tsx'
import { useStore } from '../../state/store.ts'
import AnswersNeeded from '../../components/discover/AnswersNeeded.tsx'
import PersonalityReveal from '../../components/discover/PersonalityReveal.tsx'

export const Route = createFileRoute('/_auth/personality')({ component: DiscoverReveal })

function DiscoverReveal() {
  const type = personality(useProfileAnswers())
  const note = useStore(({ plan }) => hasEnoughForPersonality(plan.answers))
    ? "Money-personality reveal (§12): type + the customer's own financial / behavioural terms with a plain meaning + risk appetite and cushion in words and terms + at most one hint (S1 K13–K17). CTA: make my plan."
    : 'Money personality needs at least 4 of the 6 Discover answers (CJ E10: no result from no answers).'
  return (
    <Screen id="DR" note={note} quiz>
      {type ? <PersonalityReveal type={type} /> : <AnswersNeeded />}
    </Screen>
  )
}

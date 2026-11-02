import { useShallow } from 'zustand/react/shallow'
import { useStore } from '../../state/store.ts'
import { personality } from '../../domain/discovery/profile.ts'
import { profileAnswered, PROFILE_QUESTIONS } from '../../domain/discovery/profileQuestions.ts'
import { riskReadFor } from '../../domain/discovery/planRiskRead.ts'
import { useProfileAnswers } from '../../hooks/useProfileAnswers.ts'

/** The money personality and risk read; confirmed once all 13 questions are answered (or `confirmed`). */
export function useProfileRead(confirmed = false) {
  const answers = useProfileAnswers()
  const answered = useStore(({ plan }) => profileAnswered(plan))
  const complete = answered === PROFILE_QUESTIONS
  // a RiskRead is flat, so a shallow compare keeps it stable
  const read = useStore(useShallow(({ plan }) => riskReadFor(plan, confirmed || complete)))
  return { type: personality(answers), read, answered, complete }
}

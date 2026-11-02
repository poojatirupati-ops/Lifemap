// The risk read of a whole plan: answers, cushion and suggested horizon.
import type { Plan } from '../../state/types.ts'
import { cushion, type CushionInputs } from './cushion.ts'
import { profileAnswers, suggestedHorizonFor } from './profile.ts'
import type { AnswerInputs } from './profileQuestions.ts'
import { riskRead } from './riskRead.ts'

/** The risk read of a plan; `complete` once Understand Me is done. */
export const riskReadFor = (
  plan: CushionInputs & AnswerInputs & Pick<Plan, 'goals' | 'about' | 'retireAge'>,
  complete: boolean,
) =>
  riskRead(profileAnswers(plan), {
    complete,
    cushion: cushion(plan),
    suggestedHorizon: suggestedHorizonFor(plan),
  })

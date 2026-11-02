// The customer's money personality and indicative risk profile, as the report shows them.
import { personality, profileAnswers } from '../../domain/discovery/profile.ts'
import { isProfileComplete } from '../../domain/discovery/profileQuestions.ts'
import { riskReadFor } from '../../domain/discovery/planRiskRead.ts'
import { moneyTerms } from '../../domain/discovery/moneyTerms.ts'
import { RISK_LABELS } from '../../domain/discovery/profile.data.ts'
import type { Plan } from '../../state/types.ts'

export function moneyProfile(plan: Plan) {
  const answers = profileAnswers(plan)
  const read = riskReadFor(plan, isProfileComplete(plan))
  const terms = moneyTerms(answers)
  const index = read.label == null ? -1 : RISK_LABELS.indexOf(read.label)
  return {
    type: personality(answers),
    read,
    /** where the risk profile sits on the scale, if it is known */
    riskIndex: index >= 0 ? index : null,
    terms: (section: string) =>
      terms.find((group) => group.section === section)?.terms.join(' · ') ?? '',
  }
}

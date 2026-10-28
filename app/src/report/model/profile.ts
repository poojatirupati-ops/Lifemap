// The customer's money personality and indicative risk profile, as the report shows them.
import {
  personality,
  moneyProfileAnswered,
  suggestedHorizon,
  type ProfileAnswers,
} from '../../domain/discovery/profile.ts'
import { riskRead } from '../../domain/discovery/riskRead.ts'
import { cushion } from '../../domain/discovery/cushion.ts'
import { moneyTerms } from '../../domain/discovery/moneyTerms.ts'
import { RISK_LABELS } from '../../domain/discovery/profile.data.ts'
import type { Plan } from '../../state/types.ts'

const UNDERSTAND_ME_QUESTIONS = 13

export function moneyProfile(plan: Plan) {
  const answers: ProfileAnswers = { discover: plan.ans, money: plan.um.a, products: plan.um.chips }
  const read = riskRead(answers, {
    complete: moneyProfileAnswered(answers) === UNDERSTAND_ME_QUESTIONS,
    cushion: cushion(plan),
    suggestedHorizon: suggestedHorizon(plan.goals, plan.about.age ?? 0, plan.retireAge),
  })
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

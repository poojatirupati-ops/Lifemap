// The two pills on Home's profile card: how much risk feels comfortable and how strong the cushion is.
import type { Plan } from '../../state/types.ts'
import { cushion, type CushionInputs } from './cushion.ts'
import { suggestedHorizonFor } from './profile.ts'
import { COMFORT_LABELS } from './profile.data.ts'
import { riskRead, type RiskRead } from './riskRead.ts'

export type ProfileCardInputs = CushionInputs &
  Pick<Plan, 'goals' | 'about' | 'retireAge' | 'moneyProfile'>

/** The first read of risk comfort and cushion, before the money profile is complete. */
export function profileRead(plan: ProfileCardInputs) {
  return riskRead(
    { discover: plan.answers, money: plan.moneyProfile.answers, products: plan.moneyProfile.chips },
    { complete: false, cushion: cushion(plan), suggestedHorizon: suggestedHorizonFor(plan) },
  )
}

/** Each pill with how many of its four meter steps are lit. */
export const profilePills = ({ comfort, cushion }: Pick<RiskRead, 'comfort' | 'cushion'>) => [
  { icon: '🌦️', label: 'Risk', value: comfort, level: COMFORT_LABELS.indexOf(comfort ?? '') + 1 },
  { icon: '🛟', label: 'Cushion', value: cushion, level: cushion ? 1 : 0 },
]

// The two pills on Home's profile card: how much risk feels comfortable and how strong the cushion is.
import { riskReadFor } from './planRiskRead.ts'
import { COMFORT_LABELS } from './profile.data.ts'
import type { RiskRead } from './riskRead.ts'

/** The first read of risk comfort and cushion, before the money profile is complete. */
export const profileRead = (plan: Parameters<typeof riskReadFor>[0]) => riskReadFor(plan, false)

/** Each pill with how many of its four meter steps are lit. */
export const profilePills = ({ comfort, cushion }: Pick<RiskRead, 'comfort' | 'cushion'>) => [
  { icon: '🌦️', label: 'Risk', value: comfort, level: COMFORT_LABELS.indexOf(comfort ?? '') + 1 },
  { icon: '🛟', label: 'Cushion', value: cushion, level: cushion ? 1 : 0 },
]

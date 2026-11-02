import type { Plan } from '../../state/types.ts'
import { assumption } from '../planning/assumptions.ts'

/** The ages a retirement can be chosen between. */
export function retirementRange(plan: Pick<Plan, 'about' | 'assumptions' | 'figures'>) {
  const min = (plan.about.age || 0) + 1
  return { min, max: Math.max(min, assumption(plan, 'planEnd') - 1) }
}

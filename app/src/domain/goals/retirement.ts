import type { Plan } from '../../state/types.ts'
import { assumption } from '../planning/assumptions.ts'
import { toNumber } from '../../lib/format.ts'

type AgeInputs = Pick<Plan, 'about' | 'assumptions' | 'figures'>

/** The ages a retirement can be chosen between. */
export function retirementRange(plan: AgeInputs) {
  const min = (plan.about.age || 0) + 1
  return { min, max: Math.max(min, assumption(plan, 'planEnd') - 1) }
}

export function partnerRetirementRange(plan: AgeInputs) {
  const age = plan.about.age || 0
  const min = (toNumber(plan.figures.pAge) || age) + 1
  return { min, max: Math.max(min, min - 1 + (assumption(plan, 'planEnd') - age) - 1) }
}

export const planEndRange = (plan: AgeInputs) => ({
  min: Math.max(50, (plan.about.age || 0) + 1),
  max: 100,
})

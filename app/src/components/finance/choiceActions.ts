// The choices only the customer makes (step 7): retirement age, plan-until age, inflation.
// TODO(Q-01): move into a planning slice in src/state once the store has per-context slices.
import { assumption } from '../../domain/planning/assumptions.ts'
import { retirementGoal } from '../../domain/goals/goals.ts'
import { percent, toNumber } from '../../lib/format.ts'
import { toast } from '../../state/shell.ts'
import { useStore } from '../../state/store.ts'
import type { Plan } from '../../state/types.ts'

const update = (recipe: (plan: Plan) => void) => useStore.getState().update(recipe)

type AgeInputs = Pick<Plan, 'about' | 'asm' | 'fin'>
const planEnd = (plan: AgeInputs) => assumption(plan, 'planEnd')

/** The ages a retirement can be chosen between. */
export function retirementRange(plan: AgeInputs) {
  const min = (plan.about.age || 0) + 1
  return { min, max: Math.max(min, planEnd(plan) - 1) }
}

export function partnerRetirementRange(plan: AgeInputs) {
  const age = plan.about.age || 0
  const min = (toNumber(plan.fin.pAge) || age) + 1
  return { min, max: Math.max(min, min - 1 + (planEnd(plan) - age) - 1) }
}

export const planEndRange = (plan: AgeInputs) => ({
  min: Math.max(50, (plan.about.age || 0) + 1),
  max: 100,
})

function setRetireAge(plan: Plan, age: number) {
  plan.retireAge = age
  plan.retireSet = true
  const goal = retirementGoal(plan.goals)
  if (goal) goal.age = age
  plan.fin.retireAge = age
}

export const chooseRetireAge = (age: number) =>
  update((plan) => {
    setRetireAge(plan, age)
    plan.src.retireAge = 'typed'
  })

export const choosePartnerRetireAge = (age: number) =>
  update((plan) => {
    plan.pRet = age
    plan.pRetSet = true
  })

/** A retirement age past the new plan-until age moves back before it. */
export function choosePlanEnd(age: number) {
  update((plan) => {
    plan.asm.planEnd = age
  })
  const { plan } = useStore.getState()
  const latest = retirementRange(plan).max
  if (!plan.retireSet || plan.retireAge <= latest) return
  update((draft) => {
    setRetireAge(draft, latest)
    draft.src.retireAge ||= 'pre'
  })
  toast(`We moved your retirement age to ${latest} so it stays before your plan-until age`)
}

/** One of the inflation chips. */
export const chooseInflation = (rate: number) =>
  update((plan) => {
    plan.infl = rate
    plan.inflOther = false
    plan.inflEdit = false
    // TODO(R-17): the version history slice; the original keeps a fixed date
    plan.versions.push({ note: `Inflation: ${percent(rate)}`, date: '29 Sep 2026' })
  })

export const chooseOwnInflation = () =>
  update((plan) => {
    plan.inflOther = true
    plan.inflEdit = true
  })

/** A rate typed as a percentage. */
export const typeInflation = (percentage: number) =>
  update((plan) => {
    plan.infl = +(percentage / 100).toFixed(4)
    plan.inflOther = true
  })

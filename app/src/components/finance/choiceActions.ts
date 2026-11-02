// The choices only the customer makes (step 7): retirement age, plan-until age, inflation.
// TODO(Q-01): move into a planning slice in src/state once the store has per-context slices.
import { assumption } from '../../domain/planning/assumptions.ts'
import { retirementGoal } from '../../domain/goals/goals.ts'
import { retirementRange } from '../../domain/goals/retirement.ts'
import { percent, toNumber } from '../../lib/format.ts'
import { toast } from '../../state/shell.ts'
import { useStore } from '../../state/store.ts'
import type { Plan } from '../../state/types.ts'
import { addVersion } from '../../state/versions.ts'

type AgeInputs = Pick<Plan, 'about' | 'assumptions' | 'figures'>
const planEnd = (plan: AgeInputs) => assumption(plan, 'planEnd')

export function partnerRetirementRange(plan: AgeInputs) {
  const age = plan.about.age || 0
  const min = (toNumber(plan.figures.pAge) || age) + 1
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
  plan.figures.retireAge = age
}

export const chooseRetireAge = (age: number) =>
  useStore.getState().update((plan) => {
    setRetireAge(plan, age)
    plan.sources.retireAge = 'typed'
  })

export const choosePartnerRetireAge = (age: number) =>
  useStore.getState().update((plan) => {
    plan.partnerRetireAge = age
    plan.partnerRetireSet = true
  })

/** A retirement age past the new plan-until age moves back before it. */
export function choosePlanEnd(age: number) {
  useStore.getState().update((plan) => {
    plan.assumptions.planEnd = age
  })
  const { plan } = useStore.getState()
  const latest = retirementRange(plan).max
  if (!plan.retireSet || plan.retireAge <= latest) return
  useStore.getState().update((draft) => {
    setRetireAge(draft, latest)
    draft.sources.retireAge ||= 'pre'
  })
  toast(`We moved your retirement age to ${latest} so it stays before your plan-until age`)
}

/** One of the inflation chips. */
export const chooseInflation = (rate: number) =>
  useStore.getState().update((plan, ui) => {
    plan.inflation = rate
    plan.inflOther = false
    ui.editingInflation = false
    // TODO(R-17): the version history slice; the original keeps a fixed date
    addVersion(plan, `Inflation: ${percent(rate)}`)
  })

export const chooseOwnInflation = () =>
  useStore.getState().update((plan, ui) => {
    plan.inflOther = true
    ui.editingInflation = true
  })

/** A rate typed as a percentage. */
export const typeInflation = (percentage: number) =>
  useStore.getState().update((plan) => {
    plan.inflation = +(percentage / 100).toFixed(4)
    plan.inflOther = true
  })

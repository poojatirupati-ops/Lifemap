// The choices only the customer makes (step 7): retirement age, plan-until age, inflation.
import { retirementGoal } from '../domain/goals/goals.ts'
import { retirementRange } from '../domain/goals/retirement.ts'
import { percent } from '../lib/format.ts'
import { toast } from './shell.ts'
import { useStore } from './store.ts'
import type { Plan } from './types.ts'
import { addVersion } from './versions.ts'

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
  const { plan, update } = useStore.getState()
  const assumptions = { ...plan.assumptions, planEnd: age }
  const latest = retirementRange({ ...plan, assumptions }).max
  const moveRetirement = plan.retireSet && plan.retireAge > latest
  update((draft) => {
    draft.assumptions.planEnd = age
    if (!moveRetirement) return
    setRetireAge(draft, latest)
    draft.sources.retireAge ||= 'pre'
  })
  if (moveRetirement) {
    toast(`We moved your retirement age to ${latest} so it stays before your plan-until age`)
  }
}

/** One of the inflation chips. */
export const chooseInflation = (rate: number) =>
  useStore.getState().update((plan, ui) => {
    plan.inflation = rate
    plan.inflOther = false
    ui.editingInflation = false
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

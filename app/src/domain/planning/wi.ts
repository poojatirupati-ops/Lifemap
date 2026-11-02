// What-if: save more (or less) towards one goal, or add a lump sum, and see the plan change.
import type { Goal, Plan } from '../../state/types'
import type { ProjectionInputs } from './planSettings'
import { project } from './project'

export interface WhatIf {
  goalId: number | null
  /** extra a month, today's money; negative saves less */
  monthly: number
  lumpSum: number
}

export const whatIfFrom = (saved: Plan['whatIf']): WhatIf => ({
  goalId: saved.goalId,
  monthly: Number(saved.monthlyExtra) || 0,
  lumpSum: Number(saved.lumpSum) || 0,
})

const EXTRA_STEPS = [
  25, 50, 75, 100, 150, 200, 250, 300, 400, 500, 600, 750, 1000, 1250, 1500, 2000,
]

/** The smallest extra a month that puts the goal on track (95%), or null if €2,000 is not enough. */
export const extraNeededFor = (plan: ProjectionInputs, goal: Goal) =>
  EXTRA_STEPS.find(
    (monthly) => project(plan, { goalId: goal.id, monthly, lumpSum: 0 }).percent[goal.id] >= 95,
  ) ?? null

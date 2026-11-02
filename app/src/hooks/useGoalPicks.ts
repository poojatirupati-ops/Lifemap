import { slippingGoals, weakestGoal } from '../domain/explore/picks.ts'
import { planMissing } from '../domain/plan/readiness.ts'
import { useStore } from '../state/store.ts'
import type { Goal } from '../state/types.ts'
import { useProjection } from './useProjection.ts'

interface GoalPicks {
  goals: Goal[]
  slipping: Goal[]
  /** Each goal's covered percent, by goal id. */
  percent: Record<number, number>
  /** A plan exists and has every answer it needs. */
  ready: boolean
  /** The goal to nudge first, once the plan is complete. */
  nudge: Goal | null
}

/** Goals that slip, and the one to nudge first, once there is a plan. */
export function useGoalPicks(): GoalPicks {
  const hasPlan = useStore((store) => Boolean(store.plan.hasResults))
  const complete = useStore((store) => planMissing(store.plan).length === 0)
  const { inputs, base } = useProjection()
  const { goals } = inputs
  if (!hasPlan) return { goals, slipping: [], percent: {}, ready: false, nudge: null }
  const { percent } = base
  return {
    goals,
    slipping: slippingGoals(goals, percent),
    percent,
    ready: complete,
    nudge: complete ? weakestGoal(goals, percent) : null,
  }
}

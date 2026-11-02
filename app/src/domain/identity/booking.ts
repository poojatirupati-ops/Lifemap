// Booking an adviser: which step shows, who the match is and what kind of expert.
import { isProfileComplete } from '../discovery/profile.ts'
import type { Goal, Plan } from '../../state/types.ts'
import { ADVISERS, type ExpertKind } from './advisers.data.ts'

/** The booking steps (c0 to c4), or the Experts tab's home before or after booking. */
export type Stage = 'c0' | 'c1' | 'c2' | 'c3' | 'c4' | 'booked' | 'home'
export type Share = keyof Plan['booking']['share']

const STEPS: readonly Stage[] = ['c0', 'c1', 'c2', 'c3', 'c4']
const isStep = (exp: string): exp is Stage => (STEPS as readonly string[]).includes(exp)

export function stageOf(plan: Pick<Plan, 'expertsPage' | 'booking'>): Stage {
  if (isStep(plan.expertsPage)) return plan.expertsPage
  return plan.booking.done ? 'booked' : 'home'
}

export const adviserOf = (plan: Pick<Plan, 'booking'>) => ADVISERS[plan.booking.adviser]
export const firstName = (name: string) => name.split(' ')[0]

/** The full profile is unfinished or its first answers are not confirmed yet. */
export const needsProfile = (plan: Plan) => !isProfileComplete(plan) || !plan.moneyProfile.rechecked

export interface Specialist {
  kind: ExpertKind
  /** the goal the match is for: the least covered one, or the one whose kind was picked */
  goal: Goal | null
  picked: boolean
}

/** The kind of expert to match: the picked one, else the one for the least covered goal. */
export function specialistFor(
  plan: Pick<Plan, 'booking' | 'goals' | 'hasResults'>,
  percent: Record<number, number>,
): Specialist {
  const picked = plan.booking.spec
  if (picked) {
    const goal = plan.goals.find((g) => g.spec === picked) ?? null
    return { kind: picked, goal, picked: true }
  }
  const worst = plan.goals.toSorted((a, b) => percent[a.id] - percent[b.id])[0]
  if (!plan.hasResults || !worst) return { kind: 'planner', goal: null, picked: false }
  return { kind: worst.spec as ExpertKind, goal: worst, picked: false }
}

// Booking an adviser: which step shows and what kind of expert. The advisers themselves come from the API (bookings/bookings.ts).
import { format } from 'date-fns/format'
import { isProfileComplete } from '../discovery/profileQuestions.ts'
import type { Goal, Plan } from '../../state/types.ts'
import { project } from '../planning/project.ts'
import type { ExpertKind } from './advisers.data.ts'

/** The booking steps (c0 to c4), or the Experts tab's home before or after booking. */
export type Stage = 'c0' | 'c1' | 'c2' | 'c3' | 'c4' | 'booked' | 'home'
export type Share = keyof Plan['booking']['share']

const STEPS: readonly Stage[] = ['c0', 'c1', 'c2', 'c3', 'c4']
const isStep = (exp: string): exp is Stage => (STEPS as readonly string[]).includes(exp)

export function stageOf(expertsPage: string, booked: boolean): Stage {
  if (isStep(expertsPage)) return expertsPage
  return booked ? 'booked' : 'home'
}

export const firstName = (name: string) => name.split(' ')[0]
export const initials = (name: string) =>
  name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)

/** "Wed 28 Oct · 10:00", the way the app shows a meeting time. */
export const slotLabel = (date: Date) => format(date, "EEE d MMM '·' HH:mm")

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

/** specialistFor with the plan's own projection (a plan without results is never projected). */
export const specialistOf = (plan: Plan) =>
  specialistFor(plan, plan.hasResults ? project(plan).percent : {})

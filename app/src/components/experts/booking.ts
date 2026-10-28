// The Experts tab's booking journey: match (c1), share (c2), pick a time (c3), booked (c4).
// TODO(Q-01): move into a booking slice in src/state once the store has per-context slices.
import { ADVISERS, EXPERTS } from '../../domain/identity/advisers.data.ts'
import { toast } from '../../state/shell.ts'
import { useStore } from '../../state/store.ts'
import type { Goal, Plan } from '../../state/types.ts'
import { profileAnswered, PROFILE_QUESTIONS, updateMe, type MePlan } from '../me/mePlan.ts'

export type ExpertKind = keyof typeof EXPERTS
export type Share = keyof Plan['book']['share']
// TODO(R-31): book.spec belongs in Plan['book'] (src/state/types.ts)
type Book = Plan['book'] & { spec?: ExpertKind | null }

const update = (recipe: (book: Book) => void) =>
  useStore.getState().update((plan) => recipe(plan.book as Book))

export const bookOf = (plan: Plan) => plan.book as Book
export const adviserOf = (plan: Plan) => ADVISERS[plan.book.adv]
export const firstName = (name: string) => name.split(' ')[0]

/** The full profile is unfinished or its first answers are not confirmed yet. */
export const needsProfile = (plan: MePlan) =>
  profileAnswered(plan) < PROFILE_QUESTIONS || !plan.um.rechecked

export interface Specialist {
  kind: ExpertKind
  /** the goal the match is for: the least covered one, or the one whose kind was picked */
  goal: Goal | null
  picked: boolean
}

/** The kind of expert to match: the picked one, else the one for the least covered goal. */
export function specialistFor(plan: Plan, percent: Record<number, number>): Specialist {
  const picked = bookOf(plan).spec
  if (picked)
    return { kind: picked, goal: plan.goals.find((g) => g.spec === picked) ?? null, picked: true }
  const worst = plan.goals.toSorted((a, b) => percent[a.id] - percent[b.id])[0]
  if (!plan.app || !worst) return { kind: 'planner', goal: null, picked: false }
  return { kind: worst.spec as ExpertKind, goal: worst, picked: false }
}

export const showStage = (stage: string) =>
  useStore.getState().update((plan) => {
    plan.tab = 'exp'
    plan.exp = stage
  })

export const nextAdviser = () =>
  update((book) => void (book.adv = (book.adv + 1) % ADVISERS.length))
export const toggleSpecialist = (kind: ExpertKind) =>
  update((book) => void (book.spec = book.spec === kind ? null : kind))
export const setShare = (item: Share, on: boolean) => update((book) => void (book.share[item] = on))
export const setAgree = (on: boolean) => update((book) => void (book.agree = on))
export const pickMode = (mode: string) => update((book) => void (book.mode = mode))
export const pickDay = (day: string) => update((book) => void (book.day = day))
export const pickSlot = (slot: string) => update((book) => void (book.slot = slot))

export function confirmBooking() {
  useStore.getState().update((plan) => {
    plan.book.done = true
    plan.exp = 'c4'
    plan.versions.push({ note: 'Adviser meeting booked', date: '29 Sep 2026' })
  })
  toast('Booked. Confirmation sent by email and SMS')
}

/** C0's "Answer the questions": the profile, then back to the match. */
export const answerProfileFirst = () =>
  updateMe((plan) => {
    plan.um.ret = 'c1'
    plan.tab = 'me'
    plan.me = 'um'
  })

/** "Check now": the profile, coming back to the match (or the Experts tab once booked). */
export function checkProfile() {
  updateMe((plan) => {
    plan.um.ret = plan.book.done ? 'exp' : 'c1'
    plan.tab = 'me'
    const complete = profileAnswered(plan) === PROFILE_QUESTIONS
    plan.me = complete ? (plan.um.rechecked ? 'umr' : 'recheck') : 'um'
  })
  useStore.getState().closeSheet()
}

/** Which step of the booking shows: c0 to c4, or the tab's home (before or after booking). */
export const stageOf = (plan: Plan) =>
  ['c0', 'c1', 'c2', 'c3', 'c4'].includes(plan.exp) ? plan.exp : plan.book.done ? 'booked' : 'home'

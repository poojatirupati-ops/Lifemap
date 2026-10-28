import { discoverAnswered, moneyProfileAnswered } from '../../domain/discovery/profile.ts'
import { answerOf, NEW_QUESTIONS } from '../define/profileActions.ts'
import { useStore } from '../../state/store.ts'
import type { Plan } from '../../state/types.ts'

// TODO(R-26): fields the original keeps on the plan that src/state/types.ts does not declare yet
export type MePlan = Plan & {
  acct: Plan['acct'] & { photo?: string }
  um: Plan['um'] & { rechecked?: boolean; ret?: string | null }
  asmOpen?: string | null
  asmBack?: string
  /** card or loan rates left for the adviser (a planning rate is used meanwhile) */
  advRate?: Record<string, boolean>
}

/** The plan with the Me tab's extra fields typed. */
export const useMePlan = <T>(select: (plan: MePlan) => T) =>
  useStore(({ plan }) => select(plan as MePlan))

export const updateMe = (recipe: (plan: MePlan) => void) =>
  useStore.getState().update((plan) => recipe(plan as MePlan))

export const DEFAULT_PHOTO = 'media/profile-photo.jpg'

/** Of the 13 money-profile questions, how many are answered. */
export const profileAnswered = (plan: Pick<Plan, 'ans' | 'um'>) =>
  moneyProfileAnswered({ discover: plan.ans, money: plan.um.a, products: plan.um.chips })

export const PROFILE_QUESTIONS = 13

export const profilePercent = (plan: Pick<Plan, 'ans' | 'um'>) =>
  Math.round((profileAnswered(plan) / PROFILE_QUESTIONS) * 100)

/** "3 of 7 left · your first 6 answers are filled in" */
export function profileLeftText(plan: Pick<Plan, 'ans' | 'um'>) {
  const left = NEW_QUESTIONS.filter((entry) => answerOf(plan, entry) == null).length
  const all = NEW_QUESTIONS.length
  const status =
    left === all
      ? `${all} quick questions`
      : left
        ? `${left} of ${all} left`
        : `All ${all} answered`
  return `${status} · your first ${discoverAnswered(plan.ans)} answers are filled in`
}

import { useStore } from '../../state/store.ts'
import type { Plan } from '../../state/types.ts'

// TODO(R-02): add to Plan in src/state/types.ts, then drop this type and the casts below:
// acct.photo, asmOpen, asmBack, advRate
export type MePlan = Plan & {
  asmOpen?: string | null
  asmBack?: string
}

/** The plan with the Me tab's extra fields typed. */
export const useMePlan = <T>(select: (plan: MePlan) => T) =>
  useStore(({ plan }) => select(plan as MePlan))

export const updateMe = (recipe: (plan: MePlan) => void) =>
  useStore.getState().update((plan) => recipe(plan as MePlan))

export const DEFAULT_PHOTO = 'media/profile-photo.jpg'

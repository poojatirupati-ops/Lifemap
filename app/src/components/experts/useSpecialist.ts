import { useShallow } from 'zustand/react/shallow'
import { specialistFor } from '../../domain/identity/booking.ts'
import { useProjection } from '../../hooks/useProjection.ts'
import { useStore } from '../../state/store.ts'

/** The kind of expert to match: the picked one, else the one for the least covered goal. */
export function useSpecialist() {
  const plan = useStore(
    useShallow(({ plan }) => ({
      booking: plan.booking,
      goals: plan.goals,
      hasResults: plan.hasResults,
    })),
  )
  const { base } = useProjection()
  return specialistFor(plan, plan.hasResults ? base.percent : {})
}

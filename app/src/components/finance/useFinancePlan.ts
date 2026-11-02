import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useStore } from '../../state/store.ts'
import { withLooks, type CheckPlan } from './checkList.ts'

/**
 * The parts of the plan that Your finances and Check your details read, with repayments too low
 * to clear the debt flagged for a look.
 */
export function useFinancePlan(): CheckPlan {
  const plan = useStore(
    useShallow(({ plan }) => ({
      figures: plan.figures,
      sources: plan.sources,
      warnings: plan.warnings,
      acknowledged: plan.acknowledged,
      assumptions: plan.assumptions,
      savedSections: plan.savedSections,
      about: plan.about,
      partner: plan.partner,
      lists: plan.lists,
      retireAge: plan.retireAge,
    })),
  )
  return useMemo(() => withLooks(plan), [plan])
}

import { useShallow } from 'zustand/react/shallow'
import type { CheckPlan } from '../components/finance/checkList.ts'
import { useStore } from '../state/store.ts'

/** What the finance check list reads from the plan. */
export const useCheckPlan = (): CheckPlan =>
  useStore(
    useShallow(({ plan }) => ({
      figures: plan.figures,
      about: plan.about,
      partner: plan.partner,
      lists: plan.lists,
      sources: plan.sources,
      assumptions: plan.assumptions,
      warnings: plan.warnings,
      acknowledged: plan.acknowledged,
      savedSections: plan.savedSections,
      retireAge: plan.retireAge,
    })),
  )

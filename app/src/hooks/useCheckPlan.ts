import { useMemo } from 'react'
import { withLooks, type CheckPlan } from '../components/finance/checkList.ts'
import { usePlanFields } from './usePlanFields.ts'

/** What the finance check list reads from the plan. */
export const useCheckPlan = (): CheckPlan =>
  usePlanFields(
    'figures',
    'about',
    'partner',
    'lists',
    'sources',
    'assumptions',
    'warnings',
    'acknowledged',
    'savedSections',
    'retireAge',
  )

/** The same, with repayments too low to clear the debt flagged for a look (Your finances, Check your details). */
export function useFinancePlan(): CheckPlan {
  const plan = useCheckPlan()
  return useMemo(() => withLooks(plan), [plan])
}

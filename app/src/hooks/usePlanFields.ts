import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useStore } from '../state/store.ts'
import type { Plan } from '../state/types.ts'
import { useFigures } from './useFigures.ts'

/**
 * These fields of the plan, re-rendering only when one of them changes. A new object too when the standards in use change,
 * so whatever is worked out from it (useMemo on it) is worked out again.
 */
export function usePlanFields<K extends keyof Plan>(...keys: K[]) {
  const figures = useFigures()
  const fields = useStore(
    useShallow(
      ({ plan }) => Object.fromEntries(keys.map((key) => [key, plan[key]])) as Pick<Plan, K>,
    ),
  )
  return useMemo(() => ({ ...fields }), [fields, figures])
}

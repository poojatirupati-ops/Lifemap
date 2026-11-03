import { useShallow } from 'zustand/react/shallow'
import { useStore } from '../state/store.ts'
import type { Plan } from '../state/types.ts'
import { useFigures } from './useFigures.ts'

/** These fields of the plan, re-rendering only when one of them (or the standards in use) changes. */
export function usePlanFields<K extends keyof Plan>(...keys: K[]) {
  useFigures()
  return useStore(
    useShallow(
      ({ plan }) => Object.fromEntries(keys.map((key) => [key, plan[key]])) as Pick<Plan, K>,
    ),
  )
}

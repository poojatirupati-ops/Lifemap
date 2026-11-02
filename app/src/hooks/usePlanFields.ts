import { useShallow } from 'zustand/react/shallow'
import { useStore } from '../state/store.ts'
import type { Plan } from '../state/types.ts'

/** These fields of the plan, re-rendering only when one of them changes. */
export const usePlanFields = <K extends keyof Plan>(...keys: K[]) =>
  useStore(
    useShallow(
      ({ plan }) => Object.fromEntries(keys.map((key) => [key, plan[key]])) as Pick<Plan, K>,
    ),
  )

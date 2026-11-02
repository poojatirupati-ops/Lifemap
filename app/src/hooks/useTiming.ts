import { useShallow } from 'zustand/react/shallow'
import { useStore } from '../state/store.ts'
import type { TimingInputs } from '../domain/goals/goalTiming.ts'

/** What timing text reads from the plan, re-rendering only when one of these changes. */
export const useTiming = (): TimingInputs =>
  useStore(
    useShallow(({ plan }) => ({
      about: plan.about,
      assumptions: plan.assumptions,
      figures: plan.figures,
      retireSet: plan.retireSet,
    })),
  )

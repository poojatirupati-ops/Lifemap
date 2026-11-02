import type { TimingInputs } from '../domain/goals/goalTiming.ts'
import { usePlanFields } from './usePlanFields.ts'

/** What timing text reads from the plan, re-rendering only when one of these changes. */
export const useTiming = (): TimingInputs =>
  usePlanFields('about', 'assumptions', 'figures', 'retireSet')

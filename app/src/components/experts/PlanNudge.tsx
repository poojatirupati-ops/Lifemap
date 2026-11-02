import { useStore } from '../../state/store.ts'
import { makePlan } from '../me/meActions.ts'
import Nudge from './Nudge.tsx'

/** Before a plan exists: make it first so the adviser can see it. */
export default function PlanNudge() {
  const app = useStore((store) => store.plan.hasResults)
  if (app) return null
  return (
    <Nudge
      icon="🗺️"
      text="Make your plan first so your adviser can see it. You can still book now."
      action="Make my plan"
      onAction={makePlan}
    />
  )
}

import { useShallow } from 'zustand/react/shallow'
import { chosenAssumption } from '../../domain/planning/assumptions.ts'
import { GUIDANCE_FIGURES } from '../../domain/planning/settings.data.ts'
import { useStore } from '../../state/store.ts'
import AgeChoice from '../finance/AgeChoice.tsx'
import { choosePlanEnd } from '../../state/choices.ts'
import { planEndRange } from '../../domain/goals/retirement.ts'

const { lifeMen65, lifeWomen65 } = GUIDANCE_FIGURES
const HELP = `At 65, average life expectancy in Ireland is about ${lifeMen65.value} for men and ${lifeWomen65.value} for women (${lifeMen65.by}). Choose the age you want to plan to.`

/** Plan until age: only the customer chooses it (step 7, Your assumptions, the calculators). */
export default function PlanEndChoice() {
  const plan = useStore(
    useShallow(({ plan }) => ({
      assumptions: plan.assumptions,
      about: plan.about,
      figures: plan.figures,
    })),
  )
  const planEnd = chosenAssumption(plan.assumptions, 'planEnd')
  return (
    <AgeChoice
      choice="planEnd"
      box="asm|planEnd"
      kind={planEnd != null ? 'mine' : 'req'}
      label="Plan until age (life expectancy)"
      age={planEnd != null ? Number(planEnd) : null}
      range={planEndRange(plan)}
      help={HELP}
      onChoose={choosePlanEnd}
    />
  )
}

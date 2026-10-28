import { useMemo } from 'react'
import type { CalcPlan } from '../components/calc/context.ts'
import { missingText } from '../components/calc/values.ts'
import { makePlan } from '../components/me/meActions.ts'
import { useStore } from '../state/store.ts'
import { calcHandoff } from './calcResult.ts'
import CloseButton from './CloseButton.tsx'
import HandoffBody from './HandoffBody.tsx'
import SheetTitle from './SheetTitle.tsx'

export const key = 'calcadd'

/** "Add to my plan" from a calculator: needs an age, then every figure the result uses. */
export function Body({ param: toolId = '' }: { param?: string }) {
  const plan = useStore((store) => store.plan) as CalcPlan
  const adult = (plan.about.age ?? 0) >= 18
  const result = useMemo(() => (adult ? calcHandoff(plan, toolId) : null), [adult, plan, toolId])

  if (!result)
    return (
      <>
        <SheetTitle>Add your age first</SheetTitle>
        <p className="sub">
          A goal sits on your timeline at an age, so we need yours. It is step 1 of Make my plan,
          and the figures you tried here stay as they are.
        </p>
        <button className="btn" onClick={makePlan}>
          Add my age
        </button>
        <CloseButton ghost style={{ marginTop: 10 }}>
          Not now
        </CloseButton>
      </>
    )
  if (result.missing.length)
    return (
      <>
        <SheetTitle>{`${missingText(result.missing[0])} first`}</SheetTitle>
        <p className="sub">This result needs your choices before it can go in your plan.</p>
        <CloseButton>OK</CloseButton>
      </>
    )
  return <HandoffBody toolId={toolId} goal={result.goal} />
}

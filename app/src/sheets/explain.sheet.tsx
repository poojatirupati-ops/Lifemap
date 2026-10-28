import { useMemo } from 'react'
import { project } from '../domain/planning/project.ts'
import { useStore } from '../state/store.ts'
import CloseButton from './CloseButton.tsx'
import { findings, goalLineText } from './planFindings.ts'
import SheetTitle from './SheetTitle.tsx'

export const key = 'explain'

/** Why we say this is your main strength, gap or biggest decision. */
export function Body({ param }: { param?: string }) {
  const plan = useStore((store) => store.plan)
  const { found, line } = useMemo(() => {
    const projection = project(plan)
    const found = findings(plan, projection)
    return { found, line: param === 'gap' ? goalLineText(plan, projection, found.worst) : '' }
  }, [plan, param])

  return (
    <>
      {param === 'str' ? (
        <>
          <SheetTitle>Your main strength</SheetTitle>
          <p className="sub">
            {found.strength}
            {found.best
              ? '. Of all your goals, this one is the best covered by your future income, savings and pension.'
              : '. We only call something a strength when a goal is fully covered and your everyday spending is paid for.'}
          </p>
        </>
      ) : param === 'gap' ? (
        <>
          <SheetTitle>Your main gap</SheetTitle>
          <p className="sub">
            {found.gap}. When that goal comes up, your income and savings won't fully cover the cost
            with today's plan.{line ? ` ${line}.` : ''}
          </p>
        </>
      ) : (
        <>
          <SheetTitle>Your biggest decision</SheetTitle>
          <p className="sub">
            {found.decision}. Try it in <b>What if</b> below to see the effect. This is guidance,
            not advice.
          </p>
        </>
      )}
      <CloseButton>Got it</CloseButton>
    </>
  )
}

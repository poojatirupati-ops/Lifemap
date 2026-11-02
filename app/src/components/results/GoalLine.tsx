import { useMemo } from 'react'
import { extraToFullyFund, goalLineText } from '../../domain/planning/goalLine'
import type { ProjectionInputs } from '../../domain/planning/planSettings'
import type { project } from '../../domain/planning/project'
import type { WhatIf } from '../../domain/planning/wi'
import type { Goal } from '../../state/types'

interface Props {
  plan: ProjectionInputs
  /** the plan with the what-if applied */
  projection: ReturnType<typeof project>
  whatIf: WhatIf
  goal: Goal
}

/** How a goal is funded: fully, or what it needs a month against what it gets on average. */
export default function GoalLine({ plan, projection, whatIf, goal }: Props) {
  const funding = projection.goals[goal.id]
  const covered = projection.percent[goal.id]
  const extra = useMemo(
    () => (funding && covered < 100 ? extraToFullyFund(plan, goal, whatIf) : null),
    [plan, goal, whatIf, funding, covered],
  )
  if (!funding) return null
  const text = goalLineText({
    goal,
    home: plan.figures.home,
    covered,
    averageMonthly: funding.averageMonthly,
    neededMonthly: funding.neededMonthly,
    spareMonthly: projection.saving.spareMonthly,
    extra,
  })
  return <div className="gl">{text}</div>
}

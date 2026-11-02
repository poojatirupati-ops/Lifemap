import { fundingOrder } from '../../domain/planning/fund.ts'
import type { ProjectionInputs } from '../../domain/planning/planSettings.ts'
import { savingLine } from '../../domain/planning/saving.ts'
import type { WhatIf } from '../../domain/planning/wi.ts'
import type { Projection } from '../../hooks/useProjection.ts'
import GoalStatus from './GoalStatus.tsx'

interface Props {
  inputs: ProjectionInputs
  whatIf: WhatIf
  /** the plan with the what-if applied */
  projection: Projection
}

/** Your goals: how much of each your income and savings cover, in funding order once ranked. */
export default function GoalsCard({ inputs, whatIf, projection }: Props) {
  const { goals, rank } = inputs
  const ordered = rank ? fundingOrder(goals, rank) : goals.toSorted((a, b) => a.age - b.age)
  const { spareMonthly, savingMonthly } = projection.saving
  const line = savingLine(spareMonthly, savingMonthly)

  return (
    <div className="card">
      <h3 className="h">Your goals</h3>
      <p className="small" style={{ margin: '0 0 6px' }}>
        How much of each goal your future income and savings can cover.
      </p>
      <div id="r-goals">
        {line ? (
          <p className="small" style={{ margin: '0 0 10px' }}>
            {line}
          </p>
        ) : null}
        {ordered.map((goal) => (
          <GoalStatus
            key={goal.id}
            goal={goal}
            inputs={inputs}
            whatIf={whatIf}
            projection={projection}
          />
        ))}
      </div>
    </div>
  )
}

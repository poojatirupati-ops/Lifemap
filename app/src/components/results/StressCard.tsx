import { useMemo } from 'react'
import type { ProjectionInputs } from '../../domain/planning/planSettings.ts'
import { stressTest } from '../../domain/planning/stress.ts'
import type { WhatIf } from '../../domain/planning/wi.ts'
import type { Projection } from '../../hooks/useProjection.ts'
import { euro } from '../../lib/format.ts'

/** Stress test: the plan (with the what-if) if pensions and investments fell in the year before retirement. */
export default function StressCard({
  inputs,
  whatIf,
  projection,
}: {
  inputs: ProjectionInputs
  whatIf: WhatIf
  /** the plan with the what-if, already worked out */
  projection: Projection
}) {
  const stress = useMemo(() => stressTest(inputs, whatIf, projection), [inputs, whatIf, projection])
  const goals = inputs.goals.toSorted((a, b) => a.age - b.age)
  const { potAtRetirement: pot, potAtRetirementBase: potBase } = stress
  return (
    <div className="card" id="r-stress">
      <h3 className="h">Stress test: if markets fell</h3>
      <p className="small" style={{ margin: '4px 0 8px' }}>
        {stress.summary}
      </p>
      <ul className="small" style={{ margin: 0, paddingLeft: 18 }}>
        {goals.map((goal) => (
          <li key={goal.id}>
            <b>{goal.name}:</b> {stress.goals[goal.id].line}
          </li>
        ))}
      </ul>
      <p className="small" style={{ margin: '8px 0 0' }}>
        Pension at retirement: {euro(pot)}
        {pot !== potBase ? ` (in your plan: ${euro(potBase)})` : ''}. This is a test, not a
        forecast: pensions and investments fall {Math.round(stress.fall * 100)}% in the year before
        retirement; cash and savings do not.
      </p>
    </div>
  )
}

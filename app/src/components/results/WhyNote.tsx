import { useMemo } from 'react'
import { planSettings, type ProjectionInputs } from '../../domain/planning/planSettings'
import type { project } from '../../domain/planning/project'
import { whyNoteText } from '../../domain/planning/whyNote'
import type { Goal } from '../../state/types'

interface Props {
  plan: ProjectionInputs
  projection: ReturnType<typeof project>
  goal: Goal
}

/** Where a goal's money comes from, and what is still to find. */
export default function WhyNote({ plan, projection, goal }: Props) {
  const { homeValue, homeUse } = useMemo(() => planSettings(plan).figures, [plan])
  const funding = projection.goals[goal.id]
  if (!funding || goal.kind === 'retire' || goal.kind === 'legacy') return null
  const text = whyNoteText({
    funding,
    covered: projection.percent[goal.id],
    goalKind: goal.kind,
    homeValue,
    homeUse,
  })
  if (!text) return null
  return (
    <div className="gl" style={{ opacity: 0.85 }}>
      {text}
    </div>
  )
}

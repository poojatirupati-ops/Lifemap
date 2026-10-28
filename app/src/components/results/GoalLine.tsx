import { useMemo } from 'react'
import { project } from '../../domain/planning/project'
import type { ProjectionInputs } from '../../domain/planning/planSettings'
import type { WhatIf } from '../../domain/planning/wi'
import { euro } from '../../lib/format'
import type { Goal } from '../../state/types'

interface Props {
  plan: ProjectionInputs & { fin: Record<string, unknown> }
  /** the plan with the what-if applied */
  projection: ReturnType<typeof project>
  whatIf: WhatIf
  goal: Goal
}

/** The smallest extra a month (to €5) that fully funds the goal, on top of its what-if; null past €5,000. */
function extraToFullyFund(plan: ProjectionInputs, goal: Goal, whatIf: WhatIf) {
  const own = whatIf.goalId === goal.id ? whatIf : { monthly: 0, lumpSum: 0 }
  const funded = (extra: number) =>
    project(plan, { goalId: goal.id, monthly: own.monthly + extra, lumpSum: own.lumpSum }).percent[
      goal.id
    ] >= 100
  if (!funded(5000)) return null
  let low = 0
  let high = 5000
  for (let i = 0; i < 13; i++) {
    const middle = (low + high) / 2
    if (funded(middle)) high = middle
    else low = middle
  }
  return Math.ceil(high / 5) * 5
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

  const home = plan.fin.home
  const average = funding.averageMonthly
  const onAverage = `on average you'll put ${euro(average)} a month`
  let text: string
  if (goal.kind === 'mfree' && home && home !== 'Own with mortgage')
    text = 'No mortgage in Your finances: remove this goal, or add your mortgage'
  else if (covered >= 100) text = 'Fully funded' + (average > 0 ? ` · ${onAverage}` : '')
  else {
    const need = extra != null ? average + extra : Math.max(funding.neededMonthly || 0, average + 5)
    const tooMuch = extra == null || need > projection.saving.spareMonthly
    text = `Needs about ${euro(need)} a month${tooMuch ? ', more than your spare money' : ''} · ${onAverage}`
  }
  return <div className="gl">{text}</div>
}

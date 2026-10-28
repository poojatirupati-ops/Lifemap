// TODO(R-31): stand-ins for results code that is not exported yet. findings() is private to
// components/results/Findings.tsx and the goal line's words to GoalLine.tsx; export them from there
// (as pure functions) and delete this file.
import type { ProjectionInputs } from '../domain/planning/planSettings.ts'
import { livingShort, project } from '../domain/planning/project.ts'
import { extraNeededFor, whatIfFrom, type WhatIf } from '../domain/planning/wi.ts'
import { euro } from '../lib/format.ts'
import type { Goal, Plan } from '../state/types.ts'

type Projection = ReturnType<typeof project>
const byAge = (a: Goal, b: Goal) => a.age - b.age

/** Strength, gap and decision, from the plan as it stands. */
export function findings(plan: Plan, { rows, percent }: Projection) {
  const goals = plan.goals
  const worst = goals.toSorted((a, b) => percent[a.id] - percent[b.id] || byAge(a, b))[0]
  const overspending = rows.some((row) => !row.retired && livingShort(row))
  const best = overspending
    ? null
    : (goals
        .filter((goal) => percent[goal.id] >= 95)
        .sort((a, b) => percent[b.id] - percent[a.id] || byAge(a, b))[0] ?? null)
  const strength = best
    ? best.kind === 'retire'
      ? `Your pension and savings cover retiring at ${best.age}`
      : `${best.name} is ${percent[best.id]}% covered`
    : overspending
      ? 'No strength to point to yet: your spending is more than comes in'
      : 'Nothing is fully covered yet, so closing the gap comes first'
  if (percent[worst.id] >= 95) {
    const unprotected = plan.fin.life !== 'Yes' || plan.fin.ip !== 'Yes'
    const decision = unprotected
      ? 'Worth a look: would your plan cope with illness or death? An adviser can check your cover with you'
      : 'A yearly review keeps it on track'
    return { best, worst, strength, gap: 'No big gaps right now', decision }
  }
  const extra = extraNeededFor(plan as ProjectionInputs, worst)
  const decision = extra
    ? `Saving about ${euro(extra)} more a month could close this gap, on our assumptions`
    : `Moving ${worst.name.toLowerCase()} later, or changing the amount, would make the biggest difference`
  return { best, worst, strength, gap: `${worst.name} is ${percent[worst.id]}% covered`, decision }
}

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

/** How a goal is funded, as words; '' when it has no funding line. */
export function goalLineText(plan: Plan, projection: Projection, goal: Goal) {
  const funding = projection.goals[goal.id]
  if (!funding) return ''
  const covered = projection.percent[goal.id]
  const average = funding.averageMonthly
  const onAverage = `on average you'll put ${euro(average)} a month`
  const home = plan.fin.home
  if (goal.kind === 'mfree' && home && home !== 'Own with mortgage')
    return 'No mortgage in Your finances: remove this goal, or add your mortgage'
  if (covered >= 100) return 'Fully funded' + (average > 0 ? ` · ${onAverage}` : '')
  const extra = extraToFullyFund(plan as ProjectionInputs, goal, whatIfFrom(plan.wi))
  const need = extra != null ? average + extra : Math.max(funding.neededMonthly || 0, average + 5)
  const tooMuch = extra == null || need > projection.saving.spareMonthly
  return `Needs about ${euro(need)} a month${tooMuch ? ', more than your spare money' : ''} · ${onAverage}`
}

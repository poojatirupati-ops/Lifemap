// The stress test: a side run of the plan (the plan itself does not change) in which pension pots
// and invested money fall 20% in the year before retirement (this year if already retired).
import { assumption } from './assumptions'
import { STRESS_FALL } from './fundYear'
import type { ProjectionInputs } from './planSettings'
import { livingShort, project } from './project'
import type { WhatIf } from './wi'

type Projection = ReturnType<typeof project>

const runsOutAt = (projection: Projection) => projection.rows.find(livingShort)?.age ?? null

/** Each goal's covered percent after the fall, the run-out age and the pension at retirement, beside the plan's. */
export function stressTest(inputs: ProjectionInputs, whatIf?: WhatIf) {
  const plan = project(inputs, whatIf)
  const stressed = project(inputs, {
    goalId: null,
    monthly: 0,
    lumpSum: 0,
    ...whatIf,
    stress: true,
  })
  const startAge = inputs.about.age ?? 0
  const index = Math.max(0, inputs.retireAge - 1 - startAge)
  const age = startAge + index
  const year = assumption(inputs, 'startYear') + index
  const potAt = (projection: Projection) =>
    Math.round(projection.rows[Math.min(index, projection.rows.length - 1)].pension)
  const runOutAge = runsOutAt(stressed)
  const runOutAgeBase = runsOutAt(plan)
  const goals = Object.fromEntries(
    inputs.goals.map(({ id }) => {
      const before = plan.percent[id]
      const after = stressed.percent[id]
      const line =
        after < before ? `Falls from ${before}% to ${after}% covered` : `Still ${after}% covered`
      return [id, { base: before, stress: after, line }]
    }),
  )
  return {
    fall: STRESS_FALL,
    index,
    age,
    year,
    goals,
    runOutAge,
    runOutAgeBase,
    potAtRetirement: potAt(stressed),
    potAtRetirementBase: potAt(plan),
    summary: `If markets fell ${Math.round(STRESS_FALL * 100)}% in ${year} (age ${age}): ${runOutLine(runOutAge, runOutAgeBase)}.`,
  }
}

function runOutLine(runOutAge: number | null, base: number | null) {
  if (runOutAge == null) return 'your money would still last to the end of your plan'
  const inPlan =
    base == null
      ? ' (in your plan: it lasts to the end)'
      : base === runOutAge
        ? ', the same as in your plan'
        : ` (in your plan: ${base})`
  return `your money would run short at ${runOutAge}${inPlan}`
}

import { useMemo } from 'react'
import { moneyProfileAnswered } from '../../domain/discovery/profile.ts'
import { FINANCE_SECTIONS } from '../../domain/finances/sections.data.ts'
import { assumption } from '../../domain/planning/assumptions.ts'
import { project } from '../../domain/planning/project.ts'
import { useStore } from '../../state/store.ts'
import type { Plan } from '../../state/types.ts'
import { checkItems, withRepaymentLooks } from '../finance/checkList.ts'
import { FINANCE_FIELDS } from '../finance/fields.data.ts'
import { fieldSource, skippedSections, visibleFields } from '../finance/status.ts'
import { foundations } from './foundations.ts'
import { foundationStage, nextFoundation } from './nextFoundation.ts'
import { nextStep } from './nextStep.ts'

/** Money details flagged for a look (low repayments included) that the customer has not acknowledged. */
export const unseenLooks = (plan: Plan) =>
  checkItems({ ...plan, look: withRepaymentLooks(plan) }).filter(
    ({ key, state }) => state === 'look' && !plan.ack[key],
  ).length

const blankFigures = (plan: Plan) =>
  FINANCE_SECTIONS.flatMap((section) => visibleFields(section, plan)).filter(
    (key) => !FINANCE_FIELDS[key].optional && !fieldSource(key, plan),
  ).length

/** Everything Home shows that is worked out from the plan. */
export function homeSummary(plan: Plan) {
  const projection = project(plan)
  const { percent } = projection
  const levels = foundations(plan, projection)
  const byAge = plan.goals.toSorted((a, b) => a.age - b.age)
  const profileAnswers = moneyProfileAnswered({
    discover: plan.ans,
    money: plan.um.a,
    products: plan.um.chips,
  })
  const weakest = plan.goals.toSorted((a, b) => percent[a.id] - percent[b.id] || a.age - b.age)[0]
  const step = nextStep({
    looks: unseenLooks(plan),
    foundation: nextFoundation(levels, assumption(plan, 'safetyMonths')),
    profileAnswers,
    profileRechecked: !!(plan.um as { rechecked?: boolean }).rechecked,
    book: plan.book,
    weakest: weakest ? { ...weakest, percent: percent[weakest.id] } : null,
    whatIfSaved: !!plan.pref,
  })
  const covered = byAge.map((goal) => percent[goal.id])
  return {
    percent,
    levels,
    stage: plan.app ? foundationStage(levels) : 'Getting started',
    byAge,
    profileAnswers,
    step,
    readiness: covered.length
      ? Math.round(covered.reduce((sum, value) => sum + value, 0) / covered.length)
      : 0,
    onTrack: covered.filter((value) => value >= 95).length,
    rough: skippedSections(plan).length > 0 || blankFigures(plan) > 2,
  }
}

/** Home's figures, recomputed only when the plan changes. */
export function useHome() {
  const plan = useStore((store) => store.plan)
  return useMemo(() => homeSummary(plan), [plan])
}

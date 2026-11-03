import { useMemo } from 'react'
import { profileAnswered } from '../../domain/discovery/profileQuestions.ts'
import { FINANCE_SECTIONS } from '../../domain/finances/sections.data.ts'
import { assumption } from '../../domain/planning/assumptions.ts'
import { project } from '../../domain/planning/project.ts'
import { useStore } from '../../state/store.ts'
import { useFigures } from '../../hooks/useFigures.ts'
import type { Plan } from '../../state/types.ts'
import { checkItems, withRepaymentLooks, type CheckPlan } from '../finance/checkList.ts'
import { FINANCE_FIELDS } from '../../domain/finances/fields.data.ts'
import { fieldSource, skippedSections, visibleFields } from '../finance/status.ts'
import { foundations } from '../../domain/planning/foundations.ts'
import { foundationStage, nextFoundation } from '../../domain/planning/nextFoundation.ts'
import { nextStep } from '../../domain/planning/nextStep.ts'

/** Money details flagged for a look (low repayments included) that the customer has not acknowledged. */
export const unseenLooks = (plan: Plan) =>
  checkItems({ ...plan, warnings: withRepaymentLooks(plan) }).filter(
    ({ key, state }) => state === 'look' && !plan.acknowledged[key],
  ).length

const blankFigures = (plan: CheckPlan) =>
  FINANCE_SECTIONS.flatMap((section) => visibleFields(section, plan)).filter(
    (key) => !FINANCE_FIELDS[key].optional && !fieldSource(key, plan),
  ).length

/** A rough picture: a skipped money section, or more than two required figures blank (both count as €0). */
export const isRough = (plan: CheckPlan) =>
  skippedSections(plan).length > 0 || blankFigures(plan) > 2

/** Everything Home shows that is worked out from the plan. */
export function homeSummary(plan: Plan) {
  const projection = project(plan)
  const { percent } = projection
  const levels = foundations(plan, projection)
  const byAge = plan.goals.toSorted((a, b) => a.age - b.age)
  const profileAnswers = profileAnswered(plan)
  const weakest = plan.goals.toSorted((a, b) => percent[a.id] - percent[b.id] || a.age - b.age)[0]
  const step = nextStep({
    looks: unseenLooks(plan),
    foundation: nextFoundation(levels, assumption(plan, 'safetyMonths')),
    profileAnswers,
    profileRechecked: !!plan.moneyProfile.rechecked,
    book: plan.booking,
    weakest: weakest ? { ...weakest, percent: percent[weakest.id] } : null,
    whatIfSaved: !!plan.preferredWhatIf,
  })
  const covered = byAge.map((goal) => percent[goal.id])
  return {
    percent,
    levels,
    stage: plan.hasResults ? foundationStage(levels) : 'Getting started',
    byAge,
    profileAnswers,
    step,
    readiness: covered.length
      ? Math.round(covered.reduce((sum, value) => sum + value, 0) / covered.length)
      : 0,
    onTrack: covered.filter((value) => value >= 95).length,
    rough: isRough(plan),
  }
}

/** Home's figures, recomputed only when the plan or the standards in use change. */
export function useHome() {
  const plan = useStore((store) => store.plan)
  const figures = useFigures()
  return useMemo(() => homeSummary(plan), [plan, figures])
}

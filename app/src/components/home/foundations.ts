// Your financial foundations: five levels, bottom to top, read from the customer's own figures.
// TODO(Q-01): domain logic; move to src/domain/planning once that folder is open to this card.
import { assumption } from '../../domain/planning/assumptions.ts'
import {
  essentialMonthly,
  householdFigures,
  type Household,
} from '../../domain/planning/householdFigures.ts'
import type { project } from '../../domain/planning/project.ts'
import { rulesFor } from '../../domain/planning/rates.ts'
import { euro } from '../../lib/format.ts'
import type { Plan } from '../../state/types.ts'
import { debtAndProtection } from './protection.ts'

/** ok solid · mid in progress · bad needs attention · na not started · held solid above a weaker level */
export type FoundationStatus = 'ok' | 'mid' | 'bad' | 'na' | 'held'

export type Check = {
  status: FoundationStatus
  text: string
  /** the calculator that helps with it */
  tool?: string
  /** the finance section to fill in when there is nothing to check yet */
  section?: number
}

export type Foundation = Check & {
  level: number
  emoji: string
  name: string
  months?: number
  makePlan?: boolean
  checks?: Check[]
}

export type FoundationInputs = Household &
  Pick<Plan, 'fin' | 'src' | 'goals' | 'lists' | 'um' | 'app'>
type Projection = ReturnType<typeof project>

export const STATUS_LABEL: Record<FoundationStatus, string> = {
  ok: 'Solid',
  mid: 'In progress',
  bad: 'Needs attention',
  na: 'Not started',
  held: 'In place',
}

/** u14 (savings to fall back on) -> status, words and months */
const SAVINGS_ANSWER = [
  ['bad', 'Less than a month', 0.5],
  ['bad', '1 to 3 months', 2],
  ['mid', '3 to 6 months', 4.5],
  ['ok', '6 months or more', 6],
] as const

export const tenths = (months: number) => (Math.floor(months * 10) / 10).toLocaleString('en-IE')

export function foundations(plan: FoundationInputs, projection: Projection): Foundation[] {
  const figures = householdFigures(plan, rulesFor(assumption(plan, 'startYear')))
  const has = (key: string) => !!plan.src[key] && plan.fin[key] != null && plan.fin[key] !== ''
  const covered = (id: number) => projection.percent[id] >= 95
  const target = assumption(plan, 'safetyMonths')

  const spending = (): Check => {
    if ((!has('income') && plan.fin.work !== 'Not working') || !has('costsM'))
      return { status: 'na', text: 'Add your income and spending to check this', section: 1 }
    const first = projection.rows[0]
    const spare = Math.round((first.inflow - first.needs) / 12)
    const takeHome = Math.max(1, first.inflow / 12)
    if (spare < 0)
      return { status: 'bad', text: `Spending about ${euro(-spare)} a month more than comes in` }
    return {
      status: spare < 0.05 * takeHome ? 'mid' : 'ok',
      text: `About ${euro(spare)} a month spare`,
    }
  }

  const emergencyFund = (): Check & { months?: number } => {
    const essential = essentialMonthly(figures)
    if (has('cash') && has('costsM') && essential > 0) {
      const months = figures.cash / essential
      if (months >= target)
        return {
          status: 'ok',
          text: `${tenths(months)} months of essential spending · target of ${target} met`,
          months,
        }
      const status = months >= 3 ? 'mid' : 'bad'
      return { status, text: `${tenths(months)} of ${target} months of essential spending`, months }
    }
    const answer = SAVINGS_ANSWER[plan.um.a.u14]
    if (answer) {
      const [status, words, months] = answer
      return { status, text: `${words} of savings (your answer)`, months }
    }
    return { status: 'na', text: 'Add your assets to check this', section: 2 }
  }

  const fund = emergencyFund()
  const safetyGoal = plan.app && plan.goals.find((goal) => goal.k === 'safety')
  if (safetyGoal && (fund.status === 'bad' || fund.status === 'mid') && covered(safetyGoal.id)) {
    const year = assumption(plan, 'startYear') + safetyGoal.age - (plan.about.age ?? 0)
    fund.status = 'mid'
    fund.text += ` · your plan builds it by ${year}`
  }

  const goalsAndRetirement = (): Check & { makePlan?: boolean } => {
    if (!plan.app) return { status: 'na', text: 'Make your plan to check this', makePlan: true }
    const goals = plan.goals.filter((goal) => goal.kind !== 'legacy')
    if (!goals.length) return { status: 'na', text: 'Add goals to check this' }
    const onTrack = goals.filter((goal) => covered(goal.id)).length
    const low = goals.filter((goal) => projection.percent[goal.id] < 50).length
    const retirement = plan.goals.find((goal) => goal.kind === 'retire')
    const pensionUnderWay = figures.monthlyPension > 0 || (!!retirement && covered(retirement.id))
    const status =
      low > goals.length / 2 ? 'bad' : onTrack === goals.length && pensionUnderWay ? 'ok' : 'mid'
    const pension = pensionUnderWay ? ' · pension saving under way' : ' · no pension saving yet'
    return { status, text: `${onTrack} of ${goals.length} goals on track${pension}` }
  }

  // never coral: growing wealth is a choice, not a problem
  const wealth = (): Check => {
    const goals = plan.goals.filter((goal) => goal.k === 'wealth' || goal.kind === 'legacy')
    const onTrack = plan.app ? goals.find((goal) => covered(goal.id)) : undefined
    const investing = has('invest') && figures.invest > 0
    if (investing) {
      const goal = onTrack ? ` · ${onTrack.name.toLowerCase()} on track` : ''
      return { status: 'ok', text: `Investing ${euro(figures.invest)}${goal}` }
    }
    if (onTrack) return { status: 'ok', text: `${onTrack.name} on track` }
    if (goals.length) return { status: 'mid', text: `${goals[0].name} not on track yet` }
    return { status: 'na', text: 'Not started yet' }
  }

  const levels: Foundation[] = [
    { level: 1, emoji: '💶', name: 'Spend less than you earn', ...spending() },
    { level: 2, emoji: '🪂', name: 'Emergency fund', ...fund },
    {
      level: 3,
      emoji: '🛡️',
      name: 'Clear costly debt & protect your family',
      ...debtAndProtection(plan, figures),
    },
    { level: 4, emoji: '🎯', name: 'Goals & retirement', ...goalsAndRetirement() },
    { level: 5, emoji: '🌳', name: 'Grow wealth & legacy', ...wealth() },
  ]

  // no "Solid" above a weaker level
  return levels.map((level, index) =>
    level.status === 'ok' &&
    levels.slice(0, index).some(({ status }) => status === 'bad' || status === 'mid')
      ? { ...level, status: 'held', text: `${level.text} · strengthen your foundations first` }
      : level,
  )
}

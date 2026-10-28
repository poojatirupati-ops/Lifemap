// The five financial foundations, level 1 at the bottom; a weaker level holds back the ones above it.
// TODO(R-22): Home (R-25) shows these too; move to src/domain/plan/foundations.ts when it does.
import { euro } from '../../lib/format.ts'
import { essentialMonthly } from '../../domain/planning/householdFigures.ts'
import { hasFigure, type ReportContext } from './context.ts'
import { debtAndProtection } from './foundationDebt.ts'

export type FoundationState = 'ok' | 'held' | 'mid' | 'bad' | 'na'
export interface Foundation {
  level: number
  name: string
  state: FoundationState
  text: string
  /** level 2: months of essential spending saved */
  months?: number
  /** level 3: what fixes the weakest item */
  action?: string
}
export type Check = Omit<Foundation, 'level' | 'name'>

const ANSWERED_CUSHION: [FoundationState, string, number][] = [
  ['bad', 'Less than a month', 0.5],
  ['bad', '1 to 3 months', 2],
  ['mid', '3 to 6 months', 4.5],
  ['ok', '6 months or more', 6],
]

/** 4.5 -> "4.5", 12 -> "12" (one decimal, rounded down) */
export const monthsText = (months: number) => (Math.floor(months * 10) / 10).toLocaleString('en-IE')

export function foundations(context: ReportContext): Foundation[] {
  const { plan, figures: f, projection } = context
  const { fin } = plan
  const has = (key: string) => hasFigure(plan, key)
  const planMade = plan.app
  const percent = (id: number) => projection.percent[id]
  const buffer = context.settings.bufferMonths

  const spending = (): Check => {
    if ((!has('income') && fin.work !== 'Not working') || !has('costsM'))
      return { state: 'na', text: 'Add your income and spending to check this' }
    const first = context.rows[0]
    const spare = Math.round((first.inflow - first.needs) / 12)
    const net = Math.max(1, first.inflow / 12)
    return {
      state: spare < 0 ? 'bad' : spare < 0.05 * net ? 'mid' : 'ok',
      text:
        spare < 0
          ? `Spending about ${euro(-spare)} a month more than comes in`
          : `About ${euro(spare)} a month spare`,
    }
  }

  const emergencyFund = (): Check => {
    const essential = essentialMonthly(f)
    const answer = plan.um.a.u14
    const fund: Check =
      has('cash') && has('costsM') && essential > 0
        ? ((months) => ({
            state: months >= buffer ? 'ok' : months >= 3 ? 'mid' : 'bad',
            text:
              months >= buffer
                ? `${monthsText(months)} months of essential spending · target of ${buffer} met`
                : `${monthsText(months)} of ${buffer} months of essential spending`,
            months,
          }))(f.cash / essential)
        : typeof answer === 'number'
          ? {
              state: ANSWERED_CUSHION[answer][0],
              text: `${ANSWERED_CUSHION[answer][1]} of savings (your answer)`,
              months: ANSWERED_CUSHION[answer][2],
            }
          : { state: 'na', text: 'Add your assets to check this' }
    const safety = planMade && plan.goals.find((goal) => goal.k === 'safety')
    if (safety && (fund.state === 'bad' || fund.state === 'mid') && percent(safety.id) >= 95)
      return {
        ...fund,
        state: 'mid',
        text: `${fund.text} · your plan builds it by ${context.settings.startYear + safety.age - (plan.about.age ?? 0)}`,
      }
    return fund
  }

  const goalsOnTrack = (): Check => {
    if (!planMade) return { state: 'na', text: 'Make your plan to check this' }
    const goals = plan.goals.filter((goal) => goal.kind !== 'legacy')
    const on = goals.filter((goal) => percent(goal.id) >= 95).length
    const low = goals.filter((goal) => percent(goal.id) < 50).length
    const retirement = context.retirement
    const pensionOn = f.monthlyPension > 0 || (!!retirement && percent(retirement.id) >= 95)
    if (!goals.length) return { state: 'na', text: 'Add goals to check this' }
    return {
      state: low > goals.length / 2 ? 'bad' : on === goals.length && pensionOn ? 'ok' : 'mid',
      text: `${on} of ${goals.length} goals on track${pensionOn ? ' · pension saving under way' : ' · no pension saving yet'}`,
    }
  }

  const wealth = (): Check => {
    const goals = plan.goals.filter((goal) => goal.k === 'wealth' || goal.kind === 'legacy')
    const onTrack = planMade ? goals.find((goal) => percent(goal.id) >= 95) : undefined
    if (has('invest') && f.invest > 0)
      return {
        state: 'ok',
        text: `Investing ${euro(f.invest)}${onTrack ? ` · ${onTrack.name.toLowerCase()} on track` : ''}`,
      }
    if (onTrack) return { state: 'ok', text: `${onTrack.name} on track` }
    return goals.length
      ? { state: 'mid', text: `${goals[0].name} not on track yet` }
      : { state: 'na', text: 'Not started yet' }
  }

  const levels: [string, () => Check][] = [
    ['Spend less than you earn', spending],
    ['Emergency fund', emergencyFund],
    ['Clear costly debt & protect your family', () => debtAndProtection(context)],
    ['Goals & retirement', goalsOnTrack],
    ['Grow wealth & legacy', wealth],
  ]
  let weakerBelow = false
  return levels.map(([name, check], index) => {
    const found = check()
    const held = found.state === 'ok' && weakerBelow
    weakerBelow ||= found.state === 'bad' || found.state === 'mid'
    return held
      ? {
          level: index + 1,
          name,
          ...found,
          state: 'held',
          text: `${found.text} · strengthen your foundations first`,
        }
      : { level: index + 1, name, ...found }
  })
}

/** The first level not yet solid, with what to do next. */
export function nextFoundation(levels: Foundation[], buffer: number) {
  const level = levels.find((item) => item.state !== 'ok')
  if (!level) return null
  const titles = [
    level.state === 'bad' ? 'Spend less than you earn first' : 'Give yourself more room each month',
    'Build your emergency fund first',
    level.action === 'debtpay' ? 'Clear your costly debt first' : 'Check your protection first',
    'Get your goals on track',
    'Start growing your wealth when you’re ready',
  ]
  const detail =
    level.state !== 'na' && level.level === 2 && level.months != null
      ? `You’re ${monthsText(level.months)} of ${buffer} months there.`
      : `${level.text}.`
  return { level, title: titles[level.level - 1], detail }
}

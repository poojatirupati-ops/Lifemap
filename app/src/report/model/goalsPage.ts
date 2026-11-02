// Report page 5: your goals in detail.
import { euro } from '../../lib/format.ts'
import type { ReportContext } from './context.ts'
import type { GoalSummary, YearsKind } from './goals.ts'
import { worstBand } from './planPage.ts'
import { bandKey, bandText, bandTone, goalMeta, plural, shortEuro } from './text.ts'

const PAID_BY: Record<YearsKind, string> = {
  savings: 'paid from savings',
  income: 'paid from pension and State Pension',
  gap: 'a gap',
}
const CELL_STATE: Record<YearsKind, string> = { savings: 'savings', income: 'pension', gap: 'gap' }

type Retirement = Extract<GoalSummary, { retirement: unknown }>['retirement']

function retirementDetail(years: Retirement, percent: number) {
  const costToday = Math.round(years.costToday)
  const coveredToday = Math.round(years.costToday - years.gapToday)
  const first = years.strip[0]
  const last = years.strip[years.strip.length - 1]
  return {
    photo: 'retired-reading',
    bars: {
      type: 'retire',
      costValue: `about ${shortEuro(years.costToday)}`,
      coverValue: `about ${shortEuro(years.costToday - years.gapToday)}`,
      coverPct: costToday
        ? Math.max(0, Math.min(100, Math.round((1000 * coveredToday) / costToday) / 10))
        : 0,
      note:
        `In today’s money. In future euros: ${shortEuro(years.costFuture)} and ${shortEuro(Math.round(years.costFuture - years.gapFuture))} (${percent}%). ` +
        (Math.round(years.gapToday) > 0
          ? `The gap is about ${shortEuro(years.gapToday)} in today’s money.`
          : 'There is no gap.'),
    },
    years: {
      summary: `${years.fundedYears} funded · ${years.gapYears} with a gap`,
      cells: years.strip.flatMap((run) =>
        Array.from({ length: run.to - run.from + 1 }, (_, index) => ({
          age: run.from + index,
          state: CELL_STATE[run.kind],
        })),
      ),
      leftLabel: `Ages ${first.from}–${first.to}: ${PAID_BY[first.kind]}`,
      rightLabel:
        years.strip.length > 1 ? `Ages ${last.from}–${last.to}: ${PAID_BY[last.kind]}` : '',
    },
  }
}

function savingDetail({ needsM, puttingInM }: { needsM: number; puttingInM: number }) {
  return {
    bars: {
      type: 'saving',
      needValue: euro(needsM),
      putValue: euro(puttingInM),
      putPct: needsM > 0 ? Math.min(100, Math.round((1000 * puttingInM) / needsM) / 10) : 100,
    },
  }
}

export function goalsPage(context: ReportContext, goals: GoalSummary[]) {
  const retirement = goals.find((goal) => goal.kind === 'retire')
  const onTrack = goals.filter((goal) => goal.onTrack).length
  const needAttention = goals.length - onTrack
  const byAge = [...goals].sort(
    (a, b) => Number(b.kind === 'retire') - Number(a.kind === 'retire') || a.age - b.age,
  )
  const lowest =
    context.retired || !retirement ? Math.min(...goals.map((goal) => goal.pct)) : retirement.pct
  return {
    big: goals.length ? `${lowest}%` : '0 goals',
    bigLabel: !goals.length
      ? 'added so far'
      : retirement
        ? 'retirement covered'
        : 'lowest goal covered',
    bigTone: bandTone(retirement ? retirement.band : worstBand(goals)),
    title:
      needAttention === 0
        ? `All ${goals.length}${plural(goals.length, ' goal', ' goals')} on track`
        : `${onTrack} of ${goals.length} on track, ${needAttention}${plural(needAttention, ' needs', ' need')} attention`,
    goals: byAge.map((goal) => ({
      name: goal.name,
      icon: goal.key,
      pct: goal.pct,
      band: bandKey(goal.band),
      bandText: bandText(goal.band),
      meta:
        goalMeta(goal, context.yearOf(goal.age)) +
        (goal.kind === 'retire' ? ', today’s money' : ''),
      sentence: goal.sentence,
      ...('retirement' in goal
        ? retirementDetail(goal.retirement, goal.pct)
        : {
            ...(goal.key === 'home' && { photo: 'house-for-sale' }),
            ...savingDetail(goal.monthly),
          }),
    })),
  }
}

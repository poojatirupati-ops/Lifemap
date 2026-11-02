// Report page 4: your roadmap, decade by decade.
import { euro } from '../../lib/format.ts'
import type { ReportContext } from './context.ts'
import { hasShortfall } from '../../components/results/chart/cashflow.ts'
import { band, isShortYear } from '../../domain/planning/bands.ts'
import { byDecade, weather, type Weather } from '../../domain/planning/chapters.ts'
import { bandTone } from './text.ts'

const STORM = { icon: 'storm', tone: 'coral', chip: 'A gap to plan for' }
const PARTLY = { icon: 'partly', tone: 'gold', chip: 'Watch this' }
const SUN = { icon: 'sun', tone: 'good', chip: 'Comfortable' }
const WEATHER: Record<Weather, typeof SUN> = { bad: STORM, warn: PARTLY, some: PARTLY, ok: SUN }

export function roadmapPage(context: ReportContext) {
  const { plan, projection, rows, endAge, retirement, retireAge, gap, statePensionAge } = context
  const runOut = gap.runOut?.age
  const groups = byDecade(rows)
  const headline =
    runOut == null
      ? `Smooth all the way to ${endAge}`
      : retirement && runOut > retireAge
        ? `Smooth until ${retireAge}, then savings run out at ${runOut}`
        : `Savings run out at ${runOut}`

  const title = (group: (typeof groups)[number], index: number) => {
    if (index === 0) return 'You are here'
    if (retirement && group.rows.some((row) => row.retiresThisYear))
      return `You retire at ${retireAge}`
    if (group.to === endAge) return `The plan ends at ${endAge}`
    if (group.rows.some(isShortYear) && groups[index - 1].rows.some(isShortYear))
      return 'The gap grows with prices'
    return group.rows.every((row) => row.retired)
      ? 'Living on your pensions'
      : 'Building your savings'
  }

  const sentence = (group: (typeof groups)[number], decade: ReturnType<typeof weather>) => {
    const years = group.rows.length
    const short = decade.shortYears
    if (short && (years === 1 || (group.to === endAge && short === 1)))
      return `Short by about ${euro(decade.averageShort)} in the last year. In all, ${gap.rows.length} years have a gap.`
    if (short) {
      const when =
        short === years
          ? ', in every year of this decade.'
          : ` in ${short} of these ${years} years.`
      return `Short by about ${euro(decade.averageShort)} a year${when}`
    }
    if (decade.retired) return 'Living on your pensions and savings, and they hold up.'
    if (decade.kind !== 'ok') return 'Some years dip into savings. That’s what they’re for.'
    const last = group.rows[years - 1]
    return `Income comfortably covers life. Savings reach about ${euro(Math.round(last.liquid / 1000) * 1000)} by ${last.age}.`
  }

  const goalChips = (from: number, to: number) => {
    const inRange = (age: number) => age >= from && age <= to
    const goals = plan.goals
      .filter((goal) => goal.kind !== 'retire' && goal.kind !== 'legacy' && inRange(goal.age))
      .map((goal) => {
        const percent = projection.percent[goal.id]
        return { age: goal.age, text: `${goal.name} · ${percent}%`, tone: bandTone(band(percent)) }
      })
    const chips = inRange(statePensionAge)
      ? [...goals, { age: statePensionAge, text: 'State Pension age', tone: 'blue' }]
      : goals
    const shown = chips.slice(0, 3)
    if (chips.length > 3)
      shown.push({ age: chips[3].age, text: `+${chips.length - 3} more`, tone: 'grey' })
    return shown
  }

  return {
    big: runOut == null ? '0 years' : `Age ${runOut}`,
    bigLabel: runOut == null ? 'with a gap' : 'savings run out',
    bigTone: runOut == null ? 'good' : 'coral',
    title: headline,
    decades: groups.map((group, index) => {
      const decade = weather(group.rows)
      const look = WEATHER[decade.kind]
      return {
        label: `${group.decade}s`,
        range: `age ${group.from}–${group.to}`,
        icon: look.icon,
        tone: look.tone,
        title: title(group, index),
        chip: look.chip,
        text: sentence(group, decade),
        goalChips: goalChips(group.from, group.to),
        spark: {
          values: group.rows.map((row) => Math.round(row.liquid)),
          gapYears: group.rows.map(hasShortfall),
        },
      }
    }),
  }
}

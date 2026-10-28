// Report page 4: your roadmap, decade by decade.
import { euro } from '../../lib/format.ts'
import type { YearRow } from '../../domain/planning/project.ts'
import { band, hasShortfall, isShortYear, type ReportContext } from './context.ts'
import { bandTone } from './text.ts'

/** The plan's years by decade; a lone year in the 90s joins the 80s. */
function decades(rows: YearRow[]) {
  const groups: { decade: number; from: number; to: number; rows: YearRow[] }[] = []
  for (const row of rows) {
    let decade = Math.floor(row.age / 10) * 10
    if (decade === 90 && groups.length) decade = 80
    const last = groups.at(-1)
    if (last?.decade === decade) {
      last.to = row.age
      last.rows.push(row)
    } else groups.push({ decade, from: row.age, to: row.age, rows: [row] })
  }
  return groups
}

const WEATHER = {
  storm: { icon: 'storm', tone: 'coral', chip: 'A gap to plan for' },
  partly: { icon: 'partly', tone: 'gold', chip: 'Watch this' },
  sun: { icon: 'sun', tone: 'good', chip: 'Comfortable' },
}

export function roadmapPage(context: ReportContext) {
  const { plan, projection, rows, endAge, retirement, retireAge, gap, statePensionAge } = context
  const runOut = gap.runOut?.age
  const groups = decades(rows)
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

  const sentence = (group: (typeof groups)[number], short: YearRow[], dips: YearRow[]) => {
    const years = group.rows.length
    if (short.length && (years === 1 || (group.to === endAge && short.length === 1)))
      return `Short by about ${euro(short[0].shortfall)} in the last year. In all, ${gap.rows.length} years have a gap.`
    if (short.length) {
      const average = short.reduce((sum, row) => sum + row.shortfall, 0) / short.length
      const when =
        short.length === years
          ? ', in every year of this decade.'
          : ` in ${short.length} of these ${years} years.`
      return `Short by about ${euro(average)} a year${when}`
    }
    if (group.rows.every((row) => row.retired))
      return 'Living on your pensions and savings, and they hold up.'
    if (dips.length) return 'Some years dip into savings. That’s what they’re for.'
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
    eyebrow: 'YOUR ROADMAP',
    title: headline,
    lead: 'Green: income covers life. Gold: savings pay. Coral: a gap to plan for.',
    decades: groups.map((group, index) => {
      const short = group.rows.filter(isShortYear)
      const dips = group.rows.filter((row) => row.drawnFromSavings > 1 && !isShortYear(row))
      const weather = WEATHER[short.length ? 'storm' : dips.length ? 'partly' : 'sun']
      return {
        label: `${group.decade}s`,
        range: `age ${group.from}–${group.to}`,
        icon: weather.icon,
        tone: weather.tone,
        title: title(group, index),
        chip: weather.chip,
        text: sentence(group, short, dips),
        goalChips: goalChips(group.from, group.to),
        spark: {
          label: 'Savings',
          values: group.rows.map((row) => Math.round(row.liquid)),
          gapYears: group.rows.map(hasShortfall),
        },
      }
    }),
  }
}

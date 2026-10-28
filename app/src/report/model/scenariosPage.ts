// Report page 7: what could change the answer.
import type { ReportContext } from './context.ts'
import type { ScenarioRow, Scenarios } from './scenarios.ts'

const PAGE_IDS: Record<string, string> = {
  payMore: 'morePension',
  c60: 'c60pension',
  c65: 'c65pension',
}

const UNITS =
  'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen'.split(
    ' ',
  )

/** 0 to 30 in words, else digits. */
const inWords = (n: number) =>
  n < 20
    ? UNITS[n]
    : n === 20
      ? 'twenty'
      : n === 30
        ? 'thirty'
        : n < 30
          ? `twenty-${UNITS[n - 20]}`
          : String(n)

/** "One year later", "Five years later", "12 years later" */
const yearsLater = (years: number) => {
  if (years === 1) return 'One year later'
  const words = inWords(years)
  return `${words[0].toUpperCase()}${words.slice(1)} years later`
}

const tone = (percent: number) => (percent >= 95 ? 'good' : percent >= 70 ? 'gold' : 'coral')

const pageRow = (row: ScenarioRow) => ({
  id: PAGE_IDS[row.id] ?? row.id,
  title: row.title,
  sub: row.sub,
  pct: row.covered,
  gapStartsAge: row.gapStartsAt,
})

export function scenariosPage({ figures, settings }: ReportContext, scenarios: Scenarios) {
  const { today, rows, combined, allOnTrack } = scenarios
  const share = figures.statePensionShare
  const counted =
    share >= 0.999
      ? 'full State Pension counted'
      : share > 0
        ? 'part of the State Pension counted'
        : 'no State Pension counted'
  const todayRow = {
    id: 'today',
    title: 'Today’s plan',
    sub: `Retire at ${figures.retireAge}, ${counted}`,
    pct: today.covered,
    gapStartsAge: today.gapStartsAt,
    emphasis: true,
  }
  const oneChange = rows.map((row) =>
    row.age ? { ...pageRow(row), sub: yearsLater(row.age - figures.retireAge) } : pageRow(row),
  )
  const groups = [{ title: 'ONE CHANGE AT A TIME', rows: [todayRow, ...oneChange] }]
  if (combined.length) groups.push({ title: 'COMBINED', rows: combined.map(pageRow) })
  const toPct = !allOnTrack && scenarios.bestCovered != null ? scenarios.bestCovered : today.covered
  const explore = scenarios.pathToExplore
    ? scenarios.pathToExplore.text
    : allOnTrack
      ? 'Everything you told us about is covered. A yearly review keeps it on track.'
      : 'An expert can show you which changes fit your life.'
  const footnote = allOnTrack
    ? 'Results from the plan engine on your plan. An expert can confirm every figure.'
    : `Results from the plan engine on your plan; all rows except the State Pension and combined rows assume ${share > 0 ? 'your current State Pension figure' : 'no State Pension'}. A full State Pension is not confirmed. Pension money is locked until ${settings.accessAge}, so retiring before then rests on savings alone. An expert can confirm every figure.`
  return {
    fromPct: today.covered,
    toPct,
    fromTone: tone(today.covered),
    toTone: tone(toPct),
    eyebrow: 'WHAT COULD CHANGE THE ANSWER',
    title: allOnTrack
      ? 'Your plan is on track'
      : (scenarios.helpsMost?.text ?? 'Small changes can help'),
    columns: { what: 'WHAT IF YOU…', covered: 'COVERED', gap: 'GAP STARTS AT' },
    groups,
    explore: { title: 'A path to explore', text: explore },
    footnote,
  }
}

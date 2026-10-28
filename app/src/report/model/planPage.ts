// Report page 2: your plan on a page.
import type { ReportContext } from './context.ts'
import type { GoalSummary } from './goals.ts'
import type { Scenarios } from './scenarios.ts'
import { bandKey, bandText, bandTone, goalMeta, plural, shortEuro } from './text.ts'

const SHORT_NAMES: Record<string, string> = {
  family: 'Family',
  retire: 'Retirement',
  home: 'Home',
  edu: 'Education',
  travel: 'Travel',
  business: 'Business',
  mfree: 'Mortgage-free',
  safety: 'Safety net',
  wealth: 'Wealth',
  helpfam: 'Helping family',
  legacy: 'Legacy',
}
const shortName = (goal: GoalSummary) => SHORT_NAMES[goal.key] ?? goal.name
const CLOSE_TONES = ['good', 'gold', 'blue']

/** "Retirement goal on track. Home needs a bigger plan" */
function headline(goals: GoalSummary[]) {
  const onTrack = goals.filter((goal) => goal.onTrack)
  if (onTrack.length === goals.length)
    return `All ${goals.length}${plural(goals.length, ' goal is', ' goals are')} on track`
  const worst = [...goals].sort((a, b) => a.pct - b.pct)[0]
  const good = onTrack.length
    ? `${onTrack.map(shortName).join(' and ')} goal${plural(onTrack.length, '', 's')} on track. `
    : ''
  return `${good}${shortName(worst)} needs a bigger plan`
}

/** The band of the least covered goal. */
export const worstBand = (goals: GoalSummary[]) =>
  goals.length ? goals.reduce((worst, goal) => (goal.pct < worst.pct ? goal : worst)).band : 'good'

export function planPage(context: ReportContext, goals: GoalSummary[], scenarios: Scenarios) {
  const { gap, endAge } = context
  const onTrack = goals.filter((goal) => goal.onTrack).length
  const allFine = !gap.runOut && onTrack === goals.length
  const worst = worstBand(goals)
  const subline =
    goals.map((goal) => `${goal.name} is ${goal.pct}% covered.`).join(' ') +
    (scenarios.rows.length
      ? ' Counting a State Pension, a pension of your own or a later date could change this.'
      : '')
  const gapYears = gap.rows.length
  return {
    big: `${onTrack} of ${goals.length}`,
    bigLabel: 'goals on track',
    bigTone: onTrack === goals.length || worst === 'good' ? 'good' : bandTone(worst),
    eyebrow: 'YOUR PLAN ON A PAGE',
    title: allFine ? 'Your plan is on track' : goals.length ? headline(goals) : '',
    lead: allFine ? 'Your income and savings cover everything you told us about.' : subline,
    goals: goals.map((goal) => ({
      name: goal.name,
      icon: goal.key,
      kind: goal.key,
      pct: goal.pct,
      band: bandKey(goal.band),
      bandText: bandText(goal.band),
      meta: goalMeta(goal, context.yearOf(goal.age)),
      sentence: goal.sentence,
    })),
    band: gap.runOut
      ? {
          kind: 'gap',
          cells: [
            { big: `Age ${gap.runOut.age}`, small: 'savings run out' },
            {
              big: `${gapYears}${plural(gapYears, ' year', ' years')}`,
              small: `with a gap, to age ${endAge}`,
            },
            {
              big: `≈ ${shortEuro(gap.today)}`,
              small: `short in today’s money (${shortEuro(gap.future)} in future euros)`,
            },
          ],
        }
      : {
          kind: 'none',
          cells: [
            { big: `Age ${endAge}`, small: 'savings last' },
            { big: '0 years', small: 'with a gap' },
            { big: '€0', small: 'short' },
          ],
        },
    close: scenarios.topThree.length
      ? {
          title: 'What could close the gap',
          items: scenarios.topThree.map((item, index) => ({
            points: `+${item.points} points`,
            tone: CLOSE_TONES[index],
            title: item.title,
            text: item.body,
          })),
        }
      : { title: 'What keeps you on track', items: [] },
    next: {
      title: 'Next: share this plan with an expert',
      text: 'They check the numbers and choose the best way forward.',
      button: 'Meet an expert',
    },
  }
}

// Report page 1 and what every page carries: meta, footer, the road and the cover.
import type { ReportContext } from './context.ts'
import { band, isPassed } from './context.ts'
import type { GoalSummary } from './goals.ts'
import { bandTone } from './text.ts'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** The road's coloured stretches: working, living on savings, then a gap. */
function roadSegments({ startAge, endAge, retirement, retired, retireAge, gap }: ReportContext) {
  const stopsWork = retirement && !retired ? Math.min(retireAge, endAge) : startAge
  const runOut = gap.runOut?.age
  const segments = []
  if (stopsWork > startAge) segments.push({ fromAge: startAge, toAge: stopsWork, tone: 'good' })
  if (runOut == null) segments.push({ fromAge: stopsWork, toAge: endAge, tone: 'good' })
  else {
    if (runOut > stopsWork) segments.push({ fromAge: stopsWork, toAge: runOut, tone: 'gold' })
    segments.push({ fromAge: Math.max(stopsWork, runOut), toAge: endAge, tone: 'coral' })
  }
  return segments
}

function milestones(context: ReportContext) {
  const { plan, projection, startAge, endAge, retirement, retired, retireAge } = context
  const mark = (age: number, label: string, tone: string) => ({
    age,
    label,
    sub: `age ${age}`,
    tone,
    badge: String(age),
  })
  const marks = plan.goals
    .filter((goal) => goal.kind !== 'retire' && goal.kind !== 'legacy')
    .filter((goal) => !isPassed(goal, plan.about.age) && goal.age <= endAge)
    .map((goal) => mark(goal.age, goal.name, bandTone(band(projection.percent[goal.id]))))
  if (retirement && !retired && retireAge > startAge && retireAge <= endAge)
    marks.push(mark(retireAge, 'You retire', 'gold'))
  if (context.gap.runOut) marks.push(mark(context.gap.runOut.age, 'Savings run out', 'coral'))
  if (context.statePensionAge > startAge && context.statePensionAge <= endAge)
    marks.push(mark(context.statePensionAge, 'State Pension', 'blue'))
  return marks
    .sort((a, b) => a.age - b.age)
    .slice(0, 8)
    .map((item, index) => ({ ...item, side: index % 2 ? 'below' : 'above' }))
}

export function coverPages(context: ReportContext, goals: GoalSummary[]) {
  const { plan, today, figures, startAge, endAge, gap } = context
  const name = (plan.acct.name || plan.fin.name || '').trim()
  const possessive = name ? `${name}’s` : 'Your'
  const dateText = `${today.getDate()} ${MONTHS[today.getMonth()]} ${today.getFullYear()}`
  const ageToday = plan.about.ageToday ?? startAge
  const onTrack = goals.filter((goal) => goal.onTrack).length
  const allOnTrack = onTrack === goals.length
  const meta = {
    customerName: name,
    possessiveName: possessive,
    dateText,
    dateUpper: dateText.toUpperCase(),
    version: 1,
    currentAge: ageToday,
    currentYear: today.getFullYear(),
    planEndAge: endAge,
    retireAge: context.retirement ? context.retireAge : endAge,
    statePensionAge: context.statePensionAge,
    hasPartner: figures.partner,
    alreadyRetired: context.retired,
    hasMortgage: plan.fin.home === 'Own with mortgage' && figures.mortgageBalance > 0,
    headerRight: `${possessive} plan · ${dateText}`,
  }
  const footer = {
    line: 'Preliminary guidance, not financial advice. Illustrative, not guaranteed.',
    coverLine:
      'Version 1 · Preliminary guidance, not financial advice. An indicative guide: an expert can confirm the details.',
  }
  const road = {
    startAge,
    endAge,
    segments: roadSegments(context),
    milestones: milestones(context),
    startLabel: `You, today · age ${ageToday}`,
    endLabel: `Plan to age ${endAge}`,
  }
  const cover = {
    eyebrow: `PREPARED FOR ${name ? name.toUpperCase() : 'YOU'} · ${meta.dateUpper}`,
    title: `${possessive} road ahead`,
    lead: 'A clear, indicative guide to where you are, where you’re heading, and who can help you get there.',
    badge: 'YOUR PERSONAL PLAN',
    tiles: [
      {
        icon: allOnTrack ? 'sun' : onTrack ? 'partly' : 'storm',
        tone: allOnTrack ? 'good' : onTrack ? 'gold' : 'coral',
        big: `${onTrack} of ${goals.length}`,
        small: 'goals on track today',
      },
      gap.runOut
        ? {
            icon: 'storm',
            tone: 'coral',
            big: `Age ${gap.runOut.age}`,
            small: 'when savings run out',
          }
        : { icon: 'sun', tone: 'good', big: 'Covered', small: `to age ${endAge}` },
      { icon: 'storm', tone: 'blue', big: 'Next step', small: 'share your plan with an expert' },
    ],
  }
  return { meta, footer, road, cover }
}

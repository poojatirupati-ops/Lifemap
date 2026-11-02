// Questions about the customer's own plan, answered from their figures.
import { cushion } from '../../domain/discovery/cushion.ts'
import {
  hasEnoughForPersonality,
  isProfileComplete,
  suggestedHorizon,
} from '../../domain/discovery/profile.ts'
import { RISK_SET_BY } from '../../domain/discovery/profile.data.ts'
import { riskRead } from '../../domain/discovery/riskRead.ts'
import { retirementGoal } from '../../domain/goals/goals.ts'
import { hasPassed } from '../../domain/goals/when.ts'
import { findings } from '../../domain/planning/findings.ts'
import { goalLineFor } from '../../domain/planning/goalLine.ts'
import { planSettings, type ProjectionInputs } from '../../domain/planning/planSettings.ts'
import type { project } from '../../domain/planning/project.ts'
import type { WhatIf } from '../../domain/planning/wi.ts'
import { LAW_TEXT } from '../../domain/planning/rates.ts'
import { euro } from '../../lib/format.ts'
import type { Plan } from '../../state/types.ts'
import { isShortYear } from '../results/journey.ts'
import type { Topic } from './topics.tsx'

const RISK_EXPLAIN: Record<string, string> = {
  Cautious: 'You prefer steady values, even if growth is slower.',
  'Cautious–balanced': 'Mostly steady, with a little room for ups and downs.',
  Balanced: 'A mix of steadiness and growth, accepting some ups and downs.',
  'Balanced–growth': 'More focus on growth, accepting bigger ups and downs.',
  Growth: 'Growth first, comfortable with large ups and downs over the long term.',
}

type Projection = ReturnType<typeof project>
/** The projection's inputs, plus whether the plan is made and the money profile. */
export type TopicPlan = ProjectionInputs & Pick<Plan, 'hasResults' | 'moneyProfile' | 'sources'>

type Worst = ReturnType<typeof findings>['worst']

function gapTopic(plan: TopicPlan, projection: Projection, whatIf: WhatIf, worst: Worst): Topic {
  const covered = projection.percent[worst.id]
  if (covered >= 95)
    return {
      key: 'pok',
      question: 'What does "on track" mean for me?',
      answer:
        "All your goals are at least 95% covered on your figures and our assumptions. That's not a guarantee: prices, pay and markets change, so check it each year.",
    }
  const name = worst.name.toLowerCase()
  const when = hasPassed(worst, plan.about.age)
    ? ' (its date has passed, so we count it from next year: change the date in My plan)'
    : ` (age ${worst.age})`
  const yearly = worst.kind === 'retire' ? ' a year' : ''
  const line = goalLineFor(plan, projection, worst, whatIf)
  return {
    key: 'pgap',
    question: `Why is ${name} ${covered}% covered?`,
    answer: (
      <>
        When {name} comes up{when}, your income and savings are expected to cover about {covered}%
        of the {euro(worst.amount)}
        {yearly} you set, in today's money. The rest is the gap. {line ? `${line}. ` : ''}In{' '}
        <b>What if</b> you can see how saving more, adding a lump sum or moving the date changes it.
      </>
    ),
  }
}

function retirementTopic(plan: TopicPlan, projection: Projection): Topic | null {
  const retirement = retirementGoal(plan.goals)
  if (!retirement) return null
  const settings = planSettings(plan)
  const short = projection.rows.find((row) => row.age >= retirement.age && isShortYear(row))
  const lumpSum =
    settings.lumpShare > 0
      ? `${Math.round(settings.lumpShare * 100)}% of your pension is assumed taken as a lump sum: ${LAW_TEXT.lumpSum}. `
      : 'no lump sum is assumed. '
  return {
    key: 'pret',
    question: `What happens when I retire at ${retirement.age}?`,
    answer: (
      <>
        From {retirement.age}, your pension and savings pay for the {euro(retirement.amount)} a year
        you set. The State Pension (about {euro(settings.statePension)} a year) starts at{' '}
        {settings.rules.sp.age}. At retirement, {lumpSum}
        {short ? (
          <>
            Around age <b>{short.age}</b> the money runs short in this plan, which is why retirement
            shows {projection.percent[retirement.id]}%.
          </>
        ) : (
          'In this plan your money lasts to age 90.'
        )}
      </>
    ),
  }
}

function riskTopic(plan: TopicPlan): Topic {
  const complete = isProfileComplete(plan)
  const read = riskRead(
    { discover: plan.answers, money: plan.moneyProfile.answers, products: plan.moneyProfile.chips },
    {
      complete,
      cushion: cushion(plan),
      suggestedHorizon: suggestedHorizon(plan.goals, plan.about.age ?? 0, plan.retireAge),
    },
  )
  const answer = read.label ? (
    <>
      Your indicative risk profile is <b>{read.label}</b>
      {complete
        ? ''
        : ' (first read · finish your profile in Me to confirm it; until then it is never shown above Balanced)'}
      . {RISK_EXPLAIN[read.label]}
      {complete && read.limitedBy ? ` It is set by ${RISK_SET_BY[read.limitedBy]}.` : ''} It is not
      advice: your adviser confirms it with you.
    </>
  ) : (
    "We can't show a risk profile yet: the two questions about ups and downs aren't answered. You can answer them in Me."
  )
  return { key: 'prisk', question: 'What does my risk profile mean?', answer }
}

/** Questions about the customer's own results; none before the plan has goals. */
export function planTopics(plan: TopicPlan, projection: Projection, whatIf: WhatIf): Topic[] {
  if (!plan.hasResults || !plan.goals.length) return []
  const found = findings(plan, projection.rows, projection.percent)
  const topics = [
    gapTopic(plan, projection, whatIf, found.worst),
    retirementTopic(plan, projection),
  ]
  if (hasEnoughForPersonality(plan.answers)) topics.push(riskTopic(plan))
  topics.push({
    key: 'pbest',
    question: 'What is my main strength?',
    answer: `${found.strength}. ${found.strengthWhy}`,
  })
  return topics.filter((topic) => topic !== null)
}

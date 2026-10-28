// Report page 9: what happens next, with what to bring and what to ask.
import { euro } from '../../lib/format.ts'
import type { ReportContext } from './context.ts'
import { moneyProfile } from './profile.ts'

const ASSET_NAMES: Record<string, string> = {
  cash: 'cash savings',
  invest: 'investments',
  pension: 'pension value',
}

const GENERAL_QUESTIONS = [
  'Which of my goals should I fund first?',
  'Is my emergency fund the right size?',
  'How should I invest money I will not need for ten years or more?',
  'Are there tax reliefs I am missing?',
]

/** "a, b and c" */
const listed = (items: string[]) =>
  items.length > 1 ? `${items.slice(0, -1).join(', ')} and ${items.at(-1)}` : items.join('')

function beforeYouMeet(context: ReportContext) {
  const { plan, figures } = context
  const has = (key: string) => !!plan.src[key] && plan.fin[key] != null && plan.fin[key] !== ''
  const missing = Object.keys(ASSET_NAMES).filter((key) => !has(key))
  const checks = [
    missing.length && `Add your ${listed(missing.map((key) => ASSET_NAMES[key]))}`,
    figures.statePensionShare < 0.999 && 'Check your State Pension record on MyWelfare.ie',
    moneyProfile(plan).riskIndex == null && 'Finish “Understand me” for your risk profile',
    !(plan.src.life && plan.src.ip) && 'Add your protection answers',
  ].filter((item): item is string => !!item)
  return checks.length ? checks.slice(0, 4) : ['Bring your latest pension and bank statements']
}

function topics({ plan, projection, figures }: ReportContext) {
  const { percent } = projection
  const noIncomeCover = plan.fin.ip !== 'Yes' && figures.income > 0
  const BY_SPECIALISM: Record<string, string[]> = {
    pension: ['Retirement planning', 'Pensions and tax relief'],
    mortgage: ['Mortgages', 'Buying a home'],
    investment: ['Investing'],
    protection: noIncomeCover ? [] : ['Protection'],
    planner: ['Financial planning'],
  }
  const goals = [...plan.goals].sort((a, b) => percent[a.id] - percent[b.id] || a.age - b.age)
  const all = [
    ...goals.flatMap((goal) => BY_SPECIALISM[goal.spec] ?? []),
    ...(figures.statePensionShare < 0.999 || plan.goals.some((goal) => goal.spec === 'pension')
      ? ['State Pension']
      : []),
    ...(noIncomeCover ? ['Income protection'] : []),
    ...(figures.debt > 1 ? ['Clearing debt'] : []),
  ]
  return [...new Set(all)].slice(0, 6)
}

function questions(context: ReportContext) {
  const { plan, figures: f, retirement, retired, statePensionAge } = context
  const age = f.age ?? 0
  const retireAge = f.retireAge
  const access = context.settings.accessAge
  const working = f.income > 0 && f.work !== 'Not working'
  const all: (string | false)[] = []
  if (retirement && !retired)
    all.push(
      context.projection.percent[retirement.id] < 95
        ? `Is retiring at ${retireAge} realistic? If not, what age gets me closest to ${euro(retirement.amount)} a year?`
        : `Is my plan for retiring at ${retireAge} strong enough if prices or markets move against me?`,
    )
  else if (retirement)
    all.push('How should I draw income from my pension and savings so they last?')
  all.push(
    working && retireAge > age && 'How much should I pay into a pension each month, and where?',
    retirement && retireAge < access && retireAge > age
      ? `How do I cover ${retireAge} to ${access} while pension money is locked?`
      : !!retirement &&
          retireAge < statePensionAge &&
          retireAge > age &&
          `How do I cover ${retireAge} to ${statePensionAge} before the State Pension starts?`,
    working && plan.fin.ip !== 'Yes' && 'What income protection do I need, and what does it cost?',
    f.statePensionShare < 0.999 && 'How do I check my State Pension record and fill any gaps?',
    (plan.about.partner || (plan.about.deps ?? 0) > 0) &&
      plan.fin.life !== 'Yes' &&
      'How much life cover do my family and I need?',
    (f.debt > 1 || f.cardBalance > 1) &&
      'What is the best order to clear my debts and build savings?',
    ...GENERAL_QUESTIONS,
  )
  return [...new Set(all.filter((item): item is string => !!item))].slice(0, 4)
}

export function nextPage(context: ReportContext) {
  return {
    eyebrow: 'WHAT HAPPENS NEXT',
    title: 'Share your plan with an expert',
    lead: 'This guide is a starting point. An expert can confirm it, answer your questions and help you choose what to do.',
    button: 'Meet an expert in the app',
    photo: 'team-with-charts',
    steps: [
      {
        n: 1,
        title: 'Share your plan',
        text: 'Send this guide to an expert, with your permission.',
      },
      { n: 2, title: 'Meet your expert', text: 'They check the numbers and your details.' },
      { n: 3, title: 'Agree your personal plan', text: 'Choose the steps that fit your life.' },
    ],
    topics: { title: 'An expert can help with', chips: topics(context) },
    checklist: { title: 'Before you meet', items: beforeYouMeet(context) },
    questions: { title: 'Questions to ask', items: questions(context) },
    ready: {
      title: 'Ready when you are',
      text: 'Your plan stays private until you choose to share it.',
      button: 'Meet an expert',
    },
  }
}

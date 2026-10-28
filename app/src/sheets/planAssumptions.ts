// "What your plan assumes": every figure the plan uses, with where it comes from.
import { ASSUMPTIONS } from '../components/me/assumptionFields.data.ts'
import {
  formatAssumption,
  marketSuggestion,
  standardNote,
} from '../components/me/assumptionText.ts'
import { governmentRules } from '../components/me/governmentRules.ts'
import { discoverQuestion } from '../domain/discovery/questions.data.ts'
import { retirementGoal } from '../domain/goals/goals.ts'
import { assumption, chosenAssumption } from '../domain/planning/assumptions.ts'
import { planSettings, type ProjectionInputs } from '../domain/planning/planSettings.ts'
import { project } from '../domain/planning/project.ts'
import { rules2026, rulesVersion } from '../domain/planning/rates.ts'
import { standardValue } from '../domain/planning/settings.ts'
import { euro, euroWeekly, percent, toNumber } from '../lib/format.ts'
import type { Plan } from '../state/types.ts'

export const GOVERNMENT = 'Set by Government · 2026'
export const MINE = 'Your choice'
export const HOW = 'How the plan works'
export const SET = 'Set by LifeMap'
export const ASSUMED = 'Assumed: add yours'

export interface AssumptionRow {
  label: string
  value: string
  tag: string
  note?: string
}

// TODO(R-31): advRate, needs and saveUp belong in Plan (src/state/types.ts)
type AssumePlan = Plan & {
  advRate?: Record<string, boolean>
  needs?: { life?: number; ip?: number }
}

const NOT_CHOSEN = 'Not chosen yet'
const KNOWN_LIMITS =
  "Living costs stay the same through the plan. Your partner's pay is counted until the retirement age you choose for them, then only their State Pension; their own pension isn't modelled. We assume drawdown from an ARF or vested PRSA. The reduced USC rate for medical-card holders under 70 isn't applied. Auto-enrolment rates after 2028 stay at the 2026 rates. Capital gains tax uses a share-of-value assumption and ignores the yearly exemption; tax on a life-policy lump sum, rental costs, the tax-free part of a bought annuity and gift or inheritance tax are not modelled yet."
const TIMING =
  'Calculators: monthly, end of the month. Pension contributions in your plan and in the Retirement tool: paid at the end of each year (a little lower than monthly). Money you save towards goals: at the start of each year. Mortgage rates are a yearly rate ÷ 12; card, loan and APR figures are effective yearly rates.'
const ADVISER_RATE = " (a planning rate: you don't know your rate, so it is left for your adviser)"

export function planAssumptions(plan: AssumePlan, ready: boolean): AssumptionRow[] {
  const settings = planSettings(plan as ProjectionInputs)
  const { inputs, figures, rules, startYear } = settings
  const value = (key: string) => assumption(inputs, key)
  const mine = (key: string) => chosenAssumption(plan.asm, key) != null
  const chosen = (key: string) => formatAssumption(key, chosenAssumption(plan.asm, key))
  const shown = (key: string) => formatAssumption(key, inputs.asm[key] ?? value(key))
  const source = (key: string) =>
    mine(key) || key === 'planEnd'
      ? MINE
      : ASSUMPTIONS[key]?.standard || key === 'startYear'
        ? SET
        : ASSUMED
  const withNote = (label: string, text: string, key: string): AssumptionRow => ({
    label,
    value: text,
    tag: source(key),
    note: source(key) === SET ? standardNote(key) : '',
  })
  const usually = (key: string) => {
    const [low, high] = ASSUMPTIONS[key].range!(rules).map((end) => euroWeekly(end))
    return `Usually ${low}–${high} a week`
  }
  const rate = (key: string) => percent(toNumber(plan.fin[key]) / 100)
  const loanRate = (key: string, fallbackWords: string) =>
    toNumber(plan.fin[key]) > 0
      ? `${rate(key)} (from your statement)`
      : mine(key)
        ? chosen(key) + (plan.advRate?.[key] ? ADVISER_RATE : ' (your figure)')
        : `${percent(value(key))} (${fallbackWords})`
  const rateTag = (key: string) => (toNumber(plan.fin[key]) > 0 || mine(key) ? MINE : ASSUMED)
  const suggestionWords = (key: string) =>
    marketSuggestion(ASSUMPTIONS[key])?.source ?? 'a planning rate'

  const rows: AssumptionRow[] = [
    { label: 'Rules', value: rulesVersion(startYear), tag: GOVERNMENT },
    ...governmentRules(rules, startYear).map(([label, text]) => ({
      label,
      value: text,
      tag: GOVERNMENT,
    })),
  ]
  const ecb = percent(standardValue('infl') as number)
  rows.push({
    label: 'Prices rise (inflation)',
    value:
      plan.infl != null
        ? `${percent(plan.infl)} a year (ECB target ${ecb}; Ireland now ${percent(rules2026.infl.ie)}, ${rules2026.infl.ieSrc})`
        : NOT_CHOSEN,
    tag: MINE,
  })
  const growth = [
    ['Pay rises', 'wage'],
    ['Cash savings grow (after DIRT)', 'cash'],
    ['Investments grow (after charges and exit tax)', 'inv'],
    ['Pensions grow while you work (after charges)', 'pen'],
    ['Pensions grow once retired (after charges)', 'penRet'],
  ]
  for (const [label, key] of growth) rows.push(withNote(label, `${shown(key)} a year`, key))

  const prsiYears =
    plan.fin.spYears != null && plan.fin.spYears !== ''
      ? plan.fin.spYears
      : chosenAssumption(plan.asm, 'spYears')
  const basis =
    prsiYears != null
      ? `from your ${prsiYears} years of PRSI`
      : plan.fin.sp === 'Expect full'
        ? 'you expect the full rate'
        : `your figure: ${euroWeekly(value('spWeek'))} a week`
  rows.push({
    label: 'Your State Pension',
    value: figures.statePensionKnown
      ? `${euro(settings.statePension * figures.statePensionShare)} a year from ${rules.sp.age} (${basis}); taxable, no USC`
      : 'Not given yet',
    tag: usually('spWeek'),
  })
  if (plan.about.partner) {
    const share = figures.partnerStatePensionShare
    rows.push({
      label: "Your partner's State Pension",
      value:
        share === 'qa'
          ? `Qualified Adult rate, ${euroWeekly(rules2026.sp.qa66)} a week`
          : share === 1
            ? 'Full rate'
            : figures.partnerStatePensionOption === 'None'
              ? 'None'
              : mine('pSpWeek')
                ? `${euroWeekly(Number(chosenAssumption(plan.asm, 'pSpWeek')))} a week (your figure)`
                : 'Not given yet',
      tag: usually('pSpWeek'),
    })
  }
  rows.push(withNote('State Pension in future', shown('spGrow'), 'spGrow'))
  rows.push(withNote('Tax bands in future', shown('bands'), 'bands'))
  rows.push(
    {
      label: retirementGoal(plan.goals) ? 'Retirement age' : 'Work income stops at',
      value: plan.retireSet ? `Age ${plan.retireAge}` : NOT_CHOSEN,
      tag: MINE,
    },
    {
      label: 'Plan until age',
      value: mine('planEnd') ? `Age ${settings.end}` : NOT_CHOSEN,
      tag: MINE,
    },
    { label: 'Plan starts', value: String(startYear), tag: source('startYear') },
  )
  const accessAge = value('accessAge')
  const access =
    accessAge < rules.pen.earliestAge
      ? ' (an occupational scheme that allows it)'
      : ' (most pensions)'
  rows.push(withNote('Pension access age', `From ${accessAge}${access}`, 'accessAge'))
  const lumpSum = value('lumpSum')
  rows.push(
    withNote(
      'Lump sum at retirement',
      lumpSum > 0
        ? `${Math.round(lumpSum * 100)}% of your pension (tax as set by law, above)`
        : 'None',
      'lumpSum',
    ),
  )
  const planningFigure = mine('drawFixed') ? '' : ' (a planning figure: add yours)'
  const drawdown: Record<string, string> = {
    spread: 'Spread to the end of the plan, at least the legal minimum',
    min: 'The legal minimum only',
    fixed: `${euro(value('drawFixed'))} a year (today's money), at least the legal minimum${planningFigure}`,
  }
  rows.push({
    label: 'Pension drawdown',
    value: drawdown[settings.drawRule],
    tag: source('drawRule'),
  })
  if (figures.monthlyPension > 0)
    rows.push({
      label: 'Share of your pension you pay',
      value: mine('ownShare') ? chosen('ownShare') : percent(value('ownShare')),
      tag: source('ownShare'),
    })
  if (figures.mortgageBalance > 0)
    rows.push({
      label: 'Mortgage rate',
      value:
        toNumber(plan.fin.mortRate) > 0
          ? `${rate('mortRate')} (from your statement)`
          : mine('mortRate')
            ? `${chosen('mortRate')} (your figure)`
            : `${percent(value('mortRate'))} (${suggestionWords('mortRate')})`,
      tag: rateTag('mortRate'),
    })
  if (figures.cardBalance > 0)
    rows.push({
      label: 'Credit-card rate',
      value: loanRate('cardRate', 'a planning rate'),
      tag: rateTag('cardRate'),
    })
  if (figures.loanBalance > 0)
    rows.push({
      label: 'Other loans rate',
      value: loanRate('loanRate', suggestionWords('loanRate')),
      tag: rateTag('loanRate'),
    })

  const answer = plan.ans['6']
  const towardsGoals = ready
    ? `About ${euro(project(plan as ProjectionInputs).saving.savingMonthly)} a month towards your goals, `
    : ''
  const from =
    typeof answer === 'number'
      ? ` (from your answer: ${discoverQuestion('6')!.options[answer].text})`
      : mine('noAnswer')
        ? `, ${euro(value('noAnswer'))} a month until you tell us how much you could invest`
        : ''
  rows.push({
    label: 'What you save',
    value:
      plan.saveM != null
        ? `${euro(plan.saveM)} a month (your choice)`
        : `${towardsGoals}at most ${percent(settings.saving.share)} of your spare money${from}`,
    tag: plan.saveM != null || mine('saveShare') ? MINE : SET,
  })
  rows.push({ label: 'Spare money not saved', value: 'Assumed spent', tag: HOW })
  const hasFund = plan.goals.some((goal) => goal.k === 'safety')
  rows.push({
    label: 'Emergency fund',
    value: hasFund
      ? 'Your Emergency fund goal covers this'
      : `${shown('safetyMonths')} of essential spending kept aside`,
    tag: hasFund ? MINE : source('safetyMonths'),
  })
  rows.push(
    {
      label: 'Money for goals sooner than',
      value: `${shown('cashYears')}: kept as cash`,
      tag: source('cashYears'),
    },
    {
      label: 'Spare savings invested',
      value: `${shown('investShare')} (the rest in cash)`,
      tag: source('investShare'),
    },
    {
      label: 'Order your savings go to goals',
      value:
        'Your order from Which goal first? (Emergency fund first unless you move it). Until you rank: must-haves, then nice-to-haves, soonest first',
      tag: HOW,
    },
    {
      label: 'Tax for couples',
      value:
        plan.about.partner && plan.about.married === true
          ? 'Joint assessment (married / civil partners), also once retired'
          : 'Taxed as individuals',
      tag: GOVERNMENT,
    },
  )
  const { life, ip } = plan.needs ?? {}
  if (life || ip) {
    const noted = [
      life ? `life cover ${euro(life)}` : '',
      ip ? `income protection ${euro(ip)} a month` : '',
    ]
    rows.push({
      label: 'Protection needs noted for your adviser',
      value: noted.filter(Boolean).join(', '),
      tag: MINE,
    })
  }
  rows.push({ label: 'How timing is counted', value: TIMING, tag: HOW })
  rows.push({
    label: 'Capital gains tax on sold assets',
    value: `${percent(rules2026.sav.cgt)} on ${percent(value('cgtGain'))} of the value of other assets, crypto, gold or art when they are sold for a goal (assumed gain)`,
    tag: source('cgtGain'),
  })
  rows.push({ label: 'Known limits', value: KNOWN_LIMITS, tag: HOW })
  return rows
}

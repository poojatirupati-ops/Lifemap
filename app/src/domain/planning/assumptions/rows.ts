// "What your plan assumes": every figure the plan uses, with where it comes from.
import { ASSUMPTIONS, GOVERNMENT_TITLE } from '../assumptionFields.data.ts'
import { formatAssumption, marketSuggestion, standardNote, TAGS } from '../assumptionText.ts'
import { assumedValue, assumption, chosenAssumption } from '../assumptions.ts'
import { discoverQuestion } from '../../discovery/questions.data.ts'
import { retirementGoal } from '../../goals/goals.ts'
import { governmentRules } from '../governmentRules.ts'
import { planSettings, type ProjectionInputs } from '../planSettings.ts'
import { prsiRate } from '../levies.ts'
import { project } from '../project.ts'
import { rules2026, rulesVersion } from '../rates.ts'
import { standardValue } from '../settings.ts'
import { euro, euroWeekly, percent, toNumber } from '../../../lib/format.ts'
import type { Plan } from '../../../state/types.ts'

export const GOVERNMENT = GOVERNMENT_TITLE
export const MINE = TAGS.mine.text
export const HOW = 'How the plan works'
const SET = TAGS.standard.text
export const ASSUMED = TAGS.assumed.text
const NOT_CHOSEN = 'Not chosen yet'

const KNOWN_LIMITS =
  "Living costs stay the same through the plan. Your partner's pay is counted until the retirement age you choose for them, then only their State Pension; their own pension isn't modelled. We assume drawdown from an ARF or vested PRSA. The reduced USC rate for medical-card holders under 70 isn't applied. Auto-enrolment rates after 2028 stay at the 2026 rates. Where you have not entered what you paid, capital gains tax uses a share-of-value assumption and funds are assumed bought at today's value. Not included: tax on a life-policy lump sum (enter it after tax), the tax-free part of a bought annuity, gift or inheritance tax, mortgage interest relief on rented property, Local Property Tax, stamp duty and business or farm reliefs. Fund distributions are covered by exit tax. Capital gains tax and exit tax are taken in the year of the sale or the 8-year anniversary, not on the Revenue payment date (about 10 months later)."
const TIMING =
  'Calculators: monthly, end of the month. Pension contributions in your plan and in the Retirement tool: paid at the end of each year (a little lower than monthly). Money you save towards goals: at the start of each year. Mortgage rates are a yearly rate ÷ 12; card, loan and APR figures are effective yearly rates.'
const TAX_YEARS =
  'Each year of your plan uses its own rules: 2026 rules to the end of 2026, announced 2027 rules from 1 January 2027 (figures not announced keep their 2026 value)'
const STATE_PENSION_ENTITLEMENT =
  'Total Contributions Approach: your years of PRSI divided by 40 (nothing under 10 years). The 2025 to 2033 transition (the higher of the Yearly Average blend and the Total Contributions Approach) is not modelled: enter the weekly amount from your MyWelfare statement to use your own figure'
const SAVING_ORDER =
  'Your order from Which goal first? (Emergency fund first unless you move it). Until you rank: must-haves, then nice-to-haves, soonest first'
const ADVISER_RATE = " (a planning rate: you don't know your rate, so it is left for your adviser)"

const GROWTH = [
  ['Pay rises', 'wage'],
  ['Cash savings grow (after DIRT)', 'cash'],
  ['Investments grow (after charges and exit tax)', 'inv'],
  ['Pensions grow while you work (after charges)', 'pen'],
  ['Pensions grow once retired (after charges)', 'penRet'],
]

export interface AssumptionRow {
  label: string
  value: string
  tag: string
  note?: string
}

/** The projection's inputs, plus what only these rows read. */
type AssumptionPlan = ProjectionInputs &
  Pick<Plan, 'figures' | 'retireSet' | 'needs' | 'ratesForAdviser'>

/** Reads one plan's assumptions: figures, words and where each comes from. */
function assumptionReader(plan: AssumptionPlan) {
  const settings = planSettings(plan)
  const { rules } = settings
  const value = (key: string) => assumption(plan, key)
  const mine = (key: string) => chosenAssumption(plan.assumptions, key) != null
  const source = (key: string) => {
    if (mine(key) || key === 'planEnd') return MINE
    const standard = ASSUMPTIONS[key]?.standard || key === 'startYear'
    return standard ? SET : ASSUMED
  }
  return {
    plan,
    settings,
    value,
    mine,
    source,
    /** the customer's own figure, in words */
    chosen: (key: string) => formatAssumption(key, chosenAssumption(plan.assumptions, key)),
    /** the figure in use, in words */
    shown: (key: string) => formatAssumption(key, assumedValue(plan, key)),
    /** a row tagged by its source; a LifeMap standard says where it comes from */
    row: (label: string, text: string, key: string): AssumptionRow => {
      const tag = source(key)
      return {
        label,
        value: text,
        tag,
        note: tag === SET ? standardNote(key, rules, settings.direct) : '',
      }
    },
    usually: (key: string) => {
      const [low, high] = ASSUMPTIONS[key].range!(rules).map((end) => euroWeekly(end))
      return `Usually ${low}–${high} a week`
    },
  }
}

type AssumptionReader = ReturnType<typeof assumptionReader>

/** Where the State Pension figure comes from, in words. */
function stateBasis({ plan, value }: AssumptionReader) {
  const { spYears, sp } = plan.figures
  const prsiYears =
    spYears != null && spYears !== '' ? spYears : chosenAssumption(plan.assumptions, 'spYears')
  if (prsiYears != null) return `from your ${prsiYears} years of PRSI`
  if (sp === 'Expect full') return 'you expect the full rate'
  return `your figure: ${euroWeekly(value('spWeek'))} a week`
}

function statePension(reader: AssumptionReader): AssumptionRow {
  const { settings, usually } = reader
  const { figures, rules } = settings
  const yearly = euro(settings.statePension * figures.statePensionShare)
  return {
    label: 'Your State Pension',
    value: figures.statePensionKnown
      ? `${yearly} a year from ${rules.sp.age} (${stateBasis(reader)}); taxable, no USC`
      : 'Not given yet',
    tag: usually('spWeek'),
  }
}

function partnerStatePension({ plan, settings, mine }: AssumptionReader) {
  const { partnerStatePensionShare, partnerStatePensionOption } = settings.figures
  if (partnerStatePensionShare === 'qa')
    return `Qualified Adult rate, ${euroWeekly(rules2026.sp.qa66)} a week`
  if (partnerStatePensionShare === 1) return 'Full rate'
  if (partnerStatePensionOption === 'None') return 'None'
  if (!mine('pSpWeek')) return 'Not given yet'
  return `${euroWeekly(Number(chosenAssumption(plan.assumptions, 'pSpWeek')))} a week (your figure)`
}

function pensionAssumptions(reader: AssumptionReader): AssumptionRow[] {
  const { plan, settings, value, mine, source, chosen, shown, row } = reader
  const accessAge = value('accessAge')
  const lumpSum = value('lumpSum')
  const scheme =
    accessAge < settings.rules.pen.earliestAge
      ? ' (an occupational scheme that allows it)'
      : ' (most pensions)'
  const planningFigure = mine('drawFixed') ? '' : ' (a planning figure: add yours)'
  const drawdown: Record<string, string> = {
    spread: 'Spread to the end of the plan, at least the legal minimum',
    min: 'The legal minimum only',
    fixed: `${euro(value('drawFixed'))} a year (today's money), at least the legal minimum${planningFigure}`,
  }
  const partner = {
    label: "Your partner's State Pension",
    value: partnerStatePension(reader),
    tag: reader.usually('pSpWeek'),
  }
  const rows = [
    statePension(reader),
    ...(plan.about.partner ? [partner] : []),
    row('State Pension in future', shown('spGrow'), 'spGrow'),
    row('Tax bands in future', shown('bands'), 'bands'),
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
    { label: 'Plan starts', value: String(settings.startYear), tag: source('startYear') },
    row('Pension access age', `From ${accessAge}${scheme}`, 'accessAge'),
    row(
      'Lump sum at retirement',
      lumpSum > 0
        ? `${Math.round(lumpSum * 100)}% of your pension (tax as set by law, above)`
        : 'None',
      'lumpSum',
    ),
    { label: 'Pension drawdown', value: drawdown[settings.drawRule], tag: source('drawRule') },
  ]
  if (settings.figures.monthlyPension > 0)
    rows.push({
      label: 'Share of your pension you pay',
      value: mine('ownShare') ? chosen('ownShare') : percent(value('ownShare')),
      tag: source('ownShare'),
    })
  return rows
}

/** Mortgage, card and loan rates, for the debts the customer has. */
function debtRates(reader: AssumptionReader) {
  const { plan, settings, value, mine, chosen } = reader
  const { figures } = settings
  const stated = (key: string) => toNumber(plan.figures[key])
  const suggested = (key: string) => marketSuggestion(ASSUMPTIONS[key])?.source ?? 'a planning rate'
  const rateText = (key: string, otherwise: string) => {
    if (stated(key) > 0) return `${percent(stated(key) / 100)} (from your statement)`
    if (!mine(key)) return `${percent(value(key))} (${otherwise})`
    const leftForAdviser = key !== 'mortRate' && plan.ratesForAdviser?.[key]
    return chosen(key) + (leftForAdviser ? ADVISER_RATE : ' (your figure)')
  }
  const rate = (label: string, key: string, otherwise: string): AssumptionRow => ({
    label,
    value: rateText(key, otherwise),
    tag: stated(key) > 0 || mine(key) ? MINE : ASSUMED,
  })
  return [
    figures.mortgageBalance > 0 && rate('Mortgage rate', 'mortRate', suggested('mortRate')),
    figures.cardBalance > 0 && rate('Credit-card rate', 'cardRate', 'a planning rate'),
    figures.loanBalance > 0 && rate('Other loans rate', 'loanRate', suggested('loanRate')),
  ].filter((row) => row !== false)
}

/** Where the saving figure comes from, after the share of spare money. */
function answerNote({ plan, value, mine }: AssumptionReader) {
  const answer = plan.answers['6']
  if (typeof answer === 'number')
    return ` (from your answer: ${discoverQuestion('6')!.options[answer].text})`
  if (mine('noAnswer'))
    return `, ${euro(value('noAnswer'))} a month until you tell us how much you could invest`
  return ''
}

/** What the customer saves a month: their choice, else a share of spare money. */
function whatYouSave(reader: AssumptionReader, ready: boolean): AssumptionRow {
  const { plan, settings, mine } = reader
  const tag = plan.monthlySaving != null || mine('saveShare') ? MINE : SET
  if (plan.monthlySaving != null)
    return {
      label: 'What you save',
      value: `${euro(plan.monthlySaving)} a month (your choice)`,
      tag,
    }
  const towardsGoals = ready
    ? `About ${euro(project(plan).saving.savingMonthly)} a month towards your goals, `
    : ''
  const shareSaved = `at most ${percent(settings.saving.share)} of your spare money`
  return { label: 'What you save', value: `${towardsGoals}${shareSaved}${answerNote(reader)}`, tag }
}

/** Life cover and income protection needs from the calculators, if any were noted. */
function protectionNeeds({ plan }: AssumptionReader): AssumptionRow[] {
  const { life, incomeProtection } = plan.needs ?? {}
  const needs = [
    life ? `life cover ${euro(life)}` : '',
    incomeProtection ? `income protection ${euro(incomeProtection)} a month` : '',
  ].filter(Boolean)
  if (!needs.length) return []
  return [{ label: 'Protection needs noted for your adviser', value: needs.join(', '), tag: MINE }]
}

function savingAssumptions(reader: AssumptionReader, ready: boolean): AssumptionRow[] {
  const { plan, value, source, shown, settings } = reader
  const { sav } = settings.rules
  const { investmentCost, otherAssetsCost, alternativesCost } = settings.figures
  const paidAny = investmentCost != null || otherAssetsCost != null || alternativesCost != null
  const hasFund = plan.goals.some((goal) => goal.key === 'safety')
  const jointTax = plan.about.partner && plan.about.married === true
  return [
    whatYouSave(reader, ready),
    { label: 'Spare money not saved', value: 'Assumed spent', tag: HOW },
    {
      label: 'Emergency fund',
      value: hasFund
        ? 'Your Emergency fund goal covers this'
        : `${shown('safetyMonths')} of essential spending kept aside`,
      tag: hasFund ? MINE : source('safetyMonths'),
    },
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
    { label: 'Order your savings go to goals', value: SAVING_ORDER, tag: HOW },
    {
      label: 'Tax for couples',
      value: jointTax
        ? 'Joint assessment (married / civil partners), also once retired'
        : 'Taxed as individuals',
      tag: GOVERNMENT,
    },
    ...protectionNeeds(reader),
    { label: 'How timing is counted', value: TIMING, tag: HOW },
    { label: 'Tax year rules', value: TAX_YEARS, tag: GOVERNMENT },
    {
      label: 'Investments held as',
      value: settings.direct
        ? 'Shares held directly: growth first; capital gains tax only when sold (no exit tax, no 8-year rule)'
        : 'Funds or ETFs: growth first; exit tax when sold, and when the 8-year rule treats them as sold (the tax is taken from the fund and the cost resets)',
      tag: source('invWrapper'),
    },
    {
      label: 'Capital gains tax on sold assets',
      value: `${percent(sav.cgt)} on the gain when something is sold (33% for sales before 7 Oct 2026), after losses and the ${euro(sav.cgtExempt)} a year exemption (${euro(sav.cgtExempt * 2)} if you own them with your partner). The gain is the sale value less what you paid. Nothing is taxed while you hold it.`,
      tag: GOVERNMENT,
    },
    {
      label: 'What you paid for assets',
      value: `${paidAny ? 'Your figures where you entered them. ' : ''}Where you did not: funds and shares you hold directly are assumed bought at today's value (no gain yet); other assets and alternative investments assume ${percent(value('cgtGain'))} of their value is gain`,
      tag: source('cgtGain'),
    },
    {
      label: 'PRSI on pension (ARF) withdrawals',
      value: `The plan charges ${percent(prsiRate(settings.rules, settings.startYear))} PRSI on ARF / PRSA withdrawals before 66, and from 66 to 70 if you do not get the contributory State Pension`,
      tag: ASSUMED,
    },
    { label: 'State Pension entitlement', value: STATE_PENSION_ENTITLEMENT, tag: HOW },
    { label: 'Known limits', value: KNOWN_LIMITS, tag: HOW },
  ]
}

/** `ready`: no required choice is missing, so the plan's saving can be shown. */
export function planAssumptions(plan: AssumptionPlan, ready: boolean): AssumptionRow[] {
  const reader = assumptionReader(plan)
  const { rules, startYear } = reader.settings
  const { ie, ieSrc } = rules2026.infl
  const ecb = percent(standardValue('infl') as number)
  const inflation =
    plan.inflation != null
      ? `${percent(plan.inflation)} a year (ECB target ${ecb}; Ireland now ${percent(ie)}, ${ieSrc})`
      : NOT_CHOSEN
  return [
    { label: 'Rules', value: rulesVersion(startYear), tag: GOVERNMENT },
    ...governmentRules(rules, startYear).map(([label, value]) => ({
      label,
      value,
      tag: GOVERNMENT,
    })),
    { label: 'Prices rise (inflation)', value: inflation, tag: MINE },
    ...GROWTH.map(([label, key]) => reader.row(label, `${reader.shown(key)} a year`, key)),
    ...pensionAssumptions(reader),
    ...debtRates(reader),
    ...savingAssumptions(reader, ready),
  ]
}

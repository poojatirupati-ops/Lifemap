// The debt rate, saving, emergency fund and how-it-works rows.
import { ASSUMPTIONS } from '../assumptionFields.data.ts'
import { marketSuggestion } from '../assumptionText.ts'
import { discoverQuestion } from '../../discovery/questions.data.ts'
import { project } from '../project.ts'
import { rules2026 } from '../rates.ts'
import { euro, percent, toNumber } from '../../../lib/format.ts'
import {
  ASSUMED,
  GOVERNMENT,
  HOW,
  MINE,
  SET,
  type AssumptionReader,
  type AssumptionRow,
} from './reader.ts'
import { KNOWN_LIMITS, SAVING_ORDER, TIMING } from './texts.ts'

const ADVISER_RATE = " (a planning rate: you don't know your rate, so it is left for your adviser)"

/** Mortgage, card and loan rates, for the debts the customer has. */
export function debtRates(reader: AssumptionReader) {
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
function whatYouSave(reader: AssumptionReader, ready: boolean) {
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
  return {
    label: 'What you save',
    value: `${towardsGoals}${shareSaved}${answerNote(reader)}`,
    tag,
  }
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

export function savingAssumptions(reader: AssumptionReader, ready: boolean): AssumptionRow[] {
  const { plan, value, source, shown } = reader
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
    {
      label: 'Capital gains tax on sold assets',
      value: `${percent(rules2026.sav.cgt)} on ${percent(value('cgtGain'))} of the value of other assets, crypto, gold or art when they are sold for a goal (assumed gain)`,
      tag: source('cgtGain'),
    },
    { label: 'Known limits', value: KNOWN_LIMITS, tag: HOW },
  ]
}

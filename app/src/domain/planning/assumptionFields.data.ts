// Everything on Your assumptions (journey-spec §27), in the order shown within each group.
import { euroWeekly, percent } from '../../lib/format.ts'
import { LAW_TEXT, guideSource, rules2026, type Rules } from './rates.ts'
import { STANDARDS } from './settings.data.ts'
import { guidance, standardLabel, standardValue, type StandardKey } from './settings.ts'

export type AssumptionGroup = 'prices' | 'retire' | 'safety' | 'length'
export type NumberKind = 'pct' | 'eur' | 'eurw' | 'yrs' | 'months' | 'times' | 'age'

interface FieldBase {
  group: AssumptionGroup
  label: string
  /** A LifeMap standard (Set by LifeMap): the settings key, and the item for a list of figures. */
  standard?: StandardKey
  item?: number
  /** Set by LifeMap, with a figure that depends on the household or the date. */
  fromPlan?: boolean
  /** Worked out from other answers (the PRSI years) until the customer gives theirs. */
  workedOut?: boolean
  /** A market rate we do not know (Assumed: add yours), suggested from this published figure. */
  market?: StandardKey
  afterDirt?: boolean
  optional?: boolean
  /** Set by law within a range (Usually between X and Y), from the plan year's rules. */
  range?: (rules: Rules) => [number, number]
  by?: string
  /** A planning figure used until the customer adds theirs. */
  fallback?: number
  /** Help shown under the field; otherwise the standard's guidance. */
  help?: string | (() => string)
}

type NumberField = FieldBase & {
  kind: NumberKind
  min: number
  max: number
  step: number
  options?: undefined
}

export type ChoiceField = FieldBase & {
  kind: 'choice'
  options: [value: string | number, label: string][]
  min?: undefined
  max?: undefined
  step?: undefined
}

/** An unknown card or loan rate, when one of these balances exists, can be left for the adviser at the fallback rate. */
type AdviserRate =
  { askAdviser: true; fallback: number; balances: string[] } | { askAdviser?: undefined }

export type AssumptionField = (NumberField | ChoiceField) & AdviserRate
export type AdviserRateField = Extract<AssumptionField, { askAdviser: true }>

const { sp } = rules2026
const pct = (min: number, max: number, step: number) => ({ kind: 'pct' as const, min, max, step })

const CENTRAL_BANK_DEPOSITS = /: average rate on new fixed-term household deposits/

function cashHelp() {
  const deposits = standardValue('depRate') as number | null
  if (deposits == null) return 'Demand accounts pay less than fixed-term deposits.'
  const source = (standardLabel('depRate') ?? '').replace(CENTRAL_BANK_DEPOSITS, '')
  return `New fixed-term household deposits averaged ${percent(deposits)} before 33% DIRT (${source}). Demand accounts pay less.`
}

export const ASSUMPTION_GROUPS: [AssumptionGroup, string][] = [
  ['prices', 'Prices & growth'],
  ['retire', 'Retirement'],
  ['safety', 'Emergency fund & debt'],
  ['length', 'Plan length'],
]

export const GOVERNMENT_TITLE = 'Set by Government · 2026'

export const ASSUMPTIONS: Record<string, AssumptionField> = {
  inv: {
    group: 'prices',
    label: 'Investments grow (a year, after charges and tax)',
    ...pct(0, 7, 0.25),
    standard: 'inv',
  },
  invGross: {
    group: 'prices',
    label: 'Investments grow before fees and tax (a year; the growth and fees tools)',
    ...pct(0, 10, 0.25),
    standard: 'invGross',
  },
  cash: {
    group: 'prices',
    label: 'Cash savings earn (a year, after DIRT)',
    ...pct(0, 4, 0.05),
    standard: 'cash',
    help: cashHelp,
  },
  pen: {
    group: 'prices',
    label: 'Pension grows while you work (a year, after charges)',
    ...pct(0, 7, 0.05),
    standard: 'pen',
  },
  penRet: {
    group: 'prices',
    label: 'Pension grows once you retire (a year, after charges)',
    ...pct(0, 7, 0.05),
    standard: 'penRet',
  },
  penChg: {
    group: 'prices',
    label: 'Typical pension charges already allowed for in the pension growth above',
    ...pct(0, 2.5, 0.05),
    market: 'fundChg',
    fallback: 0.01,
    help: () => `${guidance('penChg')} ${STANDARDS.fundChg.note}.`,
  },
  wage: { group: 'prices', label: 'Pay rises (a year)', ...pct(0, 6, 0.1), standard: 'wage' },
  bands: {
    group: 'prices',
    label: 'Tax bands in future',
    kind: 'choice',
    options: [
      ['prices', 'Rise with prices'],
      ['flat', 'Stay as today'],
    ],
    standard: 'bands',
  },
  rentRise: {
    group: 'prices',
    label: 'Rent vs buy: rent rises (a year)',
    ...pct(0, 8, 0.5),
    standard: 'rentRise',
  },
  houseGrow: {
    group: 'prices',
    label: 'Rent vs buy: house prices rise (a year)',
    ...pct(0, 6, 0.5),
    standard: 'houseGrow',
  },
  upkeep: {
    group: 'prices',
    label: 'Rent vs buy: upkeep a year (share of the home value)',
    ...pct(0, 3, 0.1),
    standard: 'upkeep',
  },
  buyFees: {
    group: 'prices',
    label: 'Buying fees (legal and survey), plus stamp duty',
    kind: 'eur',
    min: 0,
    max: 10000,
    step: 250,
    market: 'buyFees',
    optional: true,
    fallback: 0,
    help: `Stamp duty is set by law and added on top: ${LAW_TEXT.stampDuty}.`,
  },
  depEarn: {
    group: 'prices',
    label: 'Rent vs buy: what the deposit could earn instead (a year, after tax)',
    ...pct(0, 6, 0.25),
    market: 'depRate',
    afterDirt: true,
    optional: true,
    fallback: 0,
  },
  riskMu1: {
    group: 'prices',
    label: 'Risk & return: Cautious style growth (a year)',
    ...pct(0, 8, 0.5),
    standard: 'riskMu',
    item: 0,
  },
  riskMu2: {
    group: 'prices',
    label: 'Risk & return: Balanced style growth (a year)',
    ...pct(0, 8, 0.5),
    standard: 'riskMu',
    item: 1,
  },
  riskMu3: {
    group: 'prices',
    label: 'Risk & return: Growth style growth (a year)',
    ...pct(0, 8, 0.5),
    standard: 'riskMu',
    item: 2,
  },
  riskVol1: {
    group: 'prices',
    label: 'Risk & return: Cautious style ups and downs (volatility)',
    ...pct(0, 25, 1),
    standard: 'riskVol',
    item: 0,
  },
  riskVol2: {
    group: 'prices',
    label: 'Risk & return: Balanced style ups and downs (volatility)',
    ...pct(0, 25, 1),
    standard: 'riskVol',
    item: 1,
  },
  riskVol3: {
    group: 'prices',
    label: 'Risk & return: Growth style ups and downs (volatility)',
    ...pct(0, 25, 1),
    standard: 'riskVol',
    item: 2,
  },
  spGrow: {
    group: 'retire',
    label: 'State Pension in future',
    kind: 'choice',
    options: [
      ['prices', 'Rises with prices'],
      ['pay', 'Rises with pay'],
      ['flat', 'Stays flat'],
    ],
    standard: 'spGrow',
  },
  spYears: {
    group: 'retire',
    label: "How many years of PRSI will you have at 66? (leave blank if you don't know)",
    kind: 'yrs',
    min: 0,
    max: 45,
    step: 1,
    range: (rules) => [rules.sp.minYears, rules.sp.fullYears],
    by: `DSP: ${sp.fullYears} for the full rate, at least ${sp.minYears} to qualify`,
    optional: true,
    help: 'Check your record on MyWelfare. If you give your years, we work out your State Pension from them (set by law).',
  },
  spWeek: {
    group: 'retire',
    label: 'Your State Pension a week at 66',
    kind: 'eurw',
    workedOut: true,
    min: 0,
    max: sp.week,
    step: 0.1,
    range: (rules) => [0, rules.sp.week],
    by: `DSP 2026: the full rate needs ${sp.fullYears} years of PRSI; partial rates are lower`,
    help: 'Your State Pension statement on MyWelfare shows your expected rate. Or tell us your PRSI years.',
  },
  pSpWeek: {
    group: 'retire',
    label: "Your partner's State Pension a week at 66",
    kind: 'eurw',
    workedOut: true,
    min: 0,
    max: sp.week,
    step: 0.1,
    range: (rules) => [0, rules.sp.week],
    by: 'DSP 2026',
    help: 'Their MyWelfare statement shows it.',
  },
  ownShare: {
    group: 'retire',
    label:
      'Of the money paid into your pension each month, the share you pay yourself (the rest is your employer)',
    ...pct(0, 100, 5),
    standard: 'ownShare',
    fromPlan: true,
  },
  retireMult: {
    group: 'retire',
    label: 'Retirement savings target: times the yearly income you need',
    kind: 'times',
    min: 20,
    max: 33,
    step: 1,
    standard: 'retireMult',
  },
  retireSpend: {
    group: 'retire',
    label: "Retirement spending if you haven't set a goal (share of today's spending)",
    ...pct(50, 120, 5),
    standard: 'retireSpend',
  },
  lumpSum: {
    group: 'retire',
    label: 'Tax-free lump sum to take at retirement (share of your pension, 0% = none)',
    ...pct(0, 25, 1),
    standard: 'lumpSum',
    help: `Set by law: ${LAW_TEXT.lumpSum}. Your adviser can compare it with leaving it invested.`,
  },
  accessAge: {
    group: 'retire',
    label: 'Earliest age you can draw your pension',
    kind: 'choice',
    options: [
      [60, 'From 60 (most pensions)'],
      [50, 'From 50 (some occupational schemes)'],
    ],
    standard: 'accessAge',
  },
  drawRule: {
    group: 'retire',
    label: 'How you draw your pension',
    kind: 'choice',
    options: [
      ['spread', 'Spread to plan end'],
      ['min', 'Minimum only (4% / 5%)'],
      ['fixed', 'Fixed amount'],
    ],
    standard: 'drawRule',
    help: `Set by law: ${LAW_TEXT.arf} from an ARF.`,
  },
  ddTiming: {
    group: 'retire',
    label: 'Drawdown tools: withdrawals taken at the',
    kind: 'choice',
    options: [
      ['start', 'Start of the year'],
      ['end', 'End of the year'],
    ],
    standard: 'ddTiming',
    help: '',
  },
  drawFixed: {
    group: 'retire',
    label: 'Fixed amount a year (today\'s money), if you chose "Fixed amount"',
    kind: 'eur',
    min: 0,
    max: 200000,
    step: 500,
    fallback: 20000,
    help: 'Never less than the legal minimum once you are 61.',
  },
  safetyMonths: {
    group: 'safety',
    label: 'Emergency fund: months of essential spending',
    kind: 'months',
    min: 1,
    max: 12,
    step: 1,
    standard: 'safetyMonths',
    fromPlan: true,
  },
  mortRate: {
    group: 'safety',
    label: "Your mortgage rate (if your statement doesn't say)",
    ...pct(1, 8, 0.05),
    market: 'mortRate',
    fallback: 0.0375,
  },
  cardRate: {
    group: 'safety',
    label: "Your credit-card rate, APR (if your statement doesn't say)",
    ...pct(0, 35, 0.5),
    market: 'cardRate',
    fallback: 0.2,
    askAdviser: true,
    balances: ['cardBal'],
    help: `Your card statement shows your APR. New credit cards can't charge more than ${percent(rules2026.guide.cardCap)} APR (${guideSource('cardCap')}); some older cards are higher.`,
  },
  loanRate: {
    group: 'safety',
    label: "Your other loans rate, APR (if your statement doesn't say)",
    ...pct(0, 25, 0.25),
    market: 'loanRate',
    fallback: 0.08,
    askAdviser: true,
    balances: ['loanBal', 'debt'],
  },
  cashYears: {
    group: 'safety',
    label: 'Money for goals sooner than this is kept as cash (years)',
    kind: 'yrs',
    min: 1,
    max: 10,
    step: 1,
    standard: 'cashYears',
  },
  investShare: {
    group: 'safety',
    label: 'Spare savings: share invested (the rest stays in cash)',
    ...pct(0, 100, 5),
    standard: 'investShare',
  },
  cgtGain: {
    group: 'safety',
    label:
      'Other assets, crypto, gold or art: share of their value that is a gain (for capital gains tax when sold)',
    ...pct(0, 100, 5),
    standard: 'cgtGain',
  },
  saveShare: {
    group: 'safety',
    label: 'Share of your spare money you save, at most',
    ...pct(0, 100, 5),
    standard: 'saveShare',
  },
  noAnswer: {
    group: 'safety',
    label: "Monthly saving if you haven't told us how much you could invest",
    kind: 'eur',
    min: 0,
    max: 5000,
    step: 25,
    standard: 'noAnswer',
  },
  lifeShare: {
    group: 'safety',
    label: 'Life cover: share of your income your family would need',
    ...pct(30, 100, 5),
    standard: 'lifeShare',
  },
  lifeYears: {
    group: 'safety',
    label: 'Life cover: years your family would need support',
    kind: 'yrs',
    min: 1,
    max: 30,
    step: 1,
    standard: 'lifeYears',
  },
  survivor: {
    group: 'safety',
    label: "Life cover: State survivor's pension a week",
    kind: 'eurw',
    min: 0,
    max: 400,
    step: 0.5,
    range: (rules) => [0, rules.sp.survivor66],
    by: `DSP 2026: ${euroWeekly(sp.survivor)} under 66, ${euroWeekly(sp.survivor66)} at 66+, nothing if not eligible`,
    fallback: sp.survivor,
    help: "Cohabiting partners can now qualify (Bereaved Partner's Pension).",
  },
  budgetNeeds: {
    group: 'safety',
    label: 'Budget split: needs',
    ...pct(0, 100, 5),
    standard: 'budget',
    item: 0,
  },
  budgetWants: {
    group: 'safety',
    label: 'Budget split: wants',
    ...pct(0, 100, 5),
    standard: 'budget',
    item: 1,
  },
  budgetSave: {
    group: 'safety',
    label: 'Budget split: savings and debt',
    ...pct(0, 100, 5),
    standard: 'budget',
    item: 2,
  },
  startYear: {
    group: 'length',
    label: 'Start the plan in',
    kind: 'choice',
    fromPlan: true,
    options: [
      [2026, '2026'],
      [2027, '2027'],
    ],
    by: 'from October most of this year has passed',
    help: 'Choose 2027 to use the Budget 2027 tax rules (announced 6 October 2026) from 1 January 2027: higher tax bands and credits, a wider 2% USC band, a €10 higher State Pension and exit tax at 35%. The Finance Bill may still change some details.',
  },
}

// Which calculator inputs are assumptions (§14), which "Your assumptions" items a tool also reads,
// how each is named in "Choose your …" and how it is set until the customer chooses.
import { ASSUMPTIONS as FIELDS, type AssumptionField } from '../planning/assumptionFields.data.ts'
import { rules2026, type Rules } from '../planning/rates.ts'
import type { StandardKey } from '../planning/settings.ts'
import { euro } from '../../lib/format.ts'

/** An input that is an assumption: a "Your assumptions" key, or one local to the tool. */
export type Binding =
  | { assumption: string }
  | { name: string; retirementAge: true }
  /** A market figure the customer's statement may show (fund charges). */
  | { name: string; market: StandardKey; format: 'pct' }
  /** A figure with a usual range (Illness Benefit, State Pension). */
  | {
      name: string
      range: (rules: Rules) => [number, number]
      by: string
      format: 'eurw' | 'eur'
    }
  /** A LifeMap standard local to the tool (years you might wait, investment style). */
  | { name: string; standard: StandardKey; format: 'yrs' | 'style' }

const statePensionYear = ({ sp }: Rules) => sp.week * sp.weeks
const FEES: Binding = { name: 'yearly fees', market: 'fundChg', format: 'pct' }
const RETIRE_AGE: Binding = { name: 'retirement age', retirementAge: true }
const MORTGAGE_RATE = { rate: { assumption: 'mortRate' } }

export const BINDINGS: Record<string, Record<string, Binding>> = {
  borrow: MORTGAGE_RATE,
  repayment: MORTGAGE_RATE,
  overpay: MORTGAGE_RATE,
  ratechange: MORTGAGE_RATE,
  term: MORTGAGE_RATE,
  mortgageprotect: MORTGAGE_RATE,
  rentbuy: { ...MORTGAGE_RATE, g: { assumption: 'houseGrow' } },
  goalplanner: { r: { assumption: 'cash' } },
  compound: { r: { assumption: 'invGross' } },
  lumpsum: {
    r: { assumption: 'invGross' },
    f: FEES,
    wait: { name: 'years you might wait', standard: 'waitYears', format: 'yrs' },
  },
  regularinvest: { g: { assumption: 'invGross' }, f: FEES },
  fees: { g: { assumption: 'invGross' }, a: FEES, b: FEES },
  realreturn: { r: { assumption: 'invGross' } },
  emergency: { mt: { assumption: 'safetyMonths' } },
  retirement: {
    g: { assumption: 'pen' },
    ra: RETIRE_AGE,
    o: {
      name: 'State Pension (other yearly income)',
      range: (rules) => [0, statePensionYear(rules)],
      by: `DSP 2026: the full State Pension is ${euro(statePensionYear(rules2026))} a year; it depends on your PRSI record`,
      format: 'eur',
    },
  },
  contrib: { g: { assumption: 'pen' } },
  avc: { g: { assumption: 'pen' } },
  lastmoney: {
    g: { assumption: 'penRet' },
    age: { name: 'age when withdrawals start', retirementAge: true },
  },
  lifecover: { y: { assumption: 'lifeYears' }, surv: { assumption: 'survivor' } },
  incomegap: {
    ib: {
      name: 'Illness Benefit',
      range: ({ sp }) => [0, sp.illness],
      by: 'DSP 2026 maximum; lower if you earned under €300 a week; needs enough PRSI',
      format: 'eurw',
    },
  },
  riskreturn: { s: { name: 'investment style', standard: 'style', format: 'style' } },
  debtpay: { apr: { assumption: 'cardRate' } },
  loan: { apr: { assumption: 'loanRate' } },
  creditcard: { apr: { assumption: 'cardRate' } },
  loanafford: { apr: { assumption: 'loanRate' } },
}

/** Assumptions a tool reads that are not one of its inputs ("Assumptions this tool uses"). */
export const TOOL_ASSUMPTIONS: Record<string, string[]> = {
  borrow: ['buyFees'],
  deposit: ['buyFees'],
  rentbuy: ['rentRise', 'upkeep', 'buyFees', 'depEarn'],
  retirement: ['wage', 'retireMult', 'lumpSum', 'accessAge'],
  contrib: ['wage'],
  lastmoney: ['ddTiming', 'planEnd'],
  drawdown: ['ddTiming', 'riskMu1', 'riskMu2', 'riskMu3'],
  riskreturn: ['riskMu1', 'riskMu2', 'riskMu3', 'riskVol1', 'riskVol2', 'riskVol3'],
  lifecover: ['lifeShare'],
  budget: ['budgetNeeds', 'budgetWants', 'budgetSave'],
}

/** Tools whose result depends on inflation, and those where today's money is a switch. */
export const INFLATION_TOOLS = [
  'realreturn',
  'lumpsum',
  'regularinvest',
  'compound',
  'retirement',
  'avc',
  'contrib',
  'goalplanner',
  'lastmoney',
  'drawdown',
]
export const ADJUSTABLE_TOOLS = ['lumpsum', 'regularinvest']

/** Old tool ids that open another tool. */
export const REDIRECTS: Record<string, string> = { inflation: 'goalplanner' }

/** The expert "Ask an expert" goes to, by tool group. */
export const EXPERT_FOR_GROUP: Record<string, string> = {
  home: 'mortgage',
  retire: 'pension',
  protect: 'protection',
  invest: 'investment',
}

// planEnd is chosen on PlanEndChoice; this describes it for the calculators.
const PLAN_END: AssumptionField = {
  group: 'length',
  label: 'Plan until age (life expectancy)',
  kind: 'age',
  min: 50,
  max: 100,
  step: 1,
}

export const fieldOf = (key: string) => (key === 'planEnd' ? PLAN_END : FIELDS[key])

/** standard: LifeMap's figure, used from the start. market: a published rate, else assumed. range: a usual range. own: the customer's alone. */
export function kindOf(key: string) {
  const field = fieldOf(key)
  if (field.standard) return 'standard'
  if (field.market) return 'market'
  if (field.range) return 'range'
  return 'own'
}

/** How a missing assumption is named: "Choose your mortgage rate". */
export const ASSUMPTION_NAMES: Record<string, string> = {
  invGross: 'growth before fees',
  cash: 'cash growth',
  pen: 'pension growth',
  penRet: 'pension growth once retired',
  wage: 'pay rises',
  rentRise: 'rent rises',
  houseGrow: 'house price growth',
  upkeep: 'upkeep',
  buyFees: 'buying fees',
  depEarn: "the deposit's earning rate",
  riskMu1: 'the Cautious style growth',
  riskMu2: 'the Balanced style growth',
  riskMu3: 'the Growth style growth',
  riskVol1: 'the Cautious style ups and downs',
  riskVol2: 'the Balanced style ups and downs',
  riskVol3: 'the Growth style ups and downs',
  retireMult: 'retirement savings target',
  lumpSum: 'retirement lump sum',
  accessAge: 'pension access age',
  ddTiming: 'withdrawal timing',
  safetyMonths: 'emergency fund months',
  mortRate: 'mortgage rate',
  cardRate: 'credit-card rate',
  loanRate: 'loan rate',
  lifeShare: 'share of income your family would need',
  lifeYears: 'years of support',
  survivor: "survivor's pension",
  budgetNeeds: 'budget split',
  budgetWants: 'budget split',
  budgetSave: 'budget split',
  planEnd: 'plan-until age',
}

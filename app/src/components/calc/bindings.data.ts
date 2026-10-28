// Which calculator inputs are assumptions (§14), which assumptions a tool also reads, and how a
// missing figure is named in "Add your … to see this".
import { rules2026, type Rules } from '../../domain/planning/rates.ts'
import type { StandardKey } from '../../domain/planning/settings.ts'
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
}

/** Assumptions a tool reads that are not one of its inputs ("Assumptions this tool uses"). */
export const TOOL_ASSUMPTIONS: Record<string, string[]> = {
  borrow: ['buyFees'],
  deposit: ['buyFees'],
  rentbuy: ['rentRise', 'upkeep', 'buyFees', 'depEarn'],
  retirement: ['wage', 'retireMult', 'lumpSum', 'accessAge'],
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

/** What a missing personal figure is called (never built from labels like "Term A"). */
export const MISSING_NAMES: Record<string, Record<string, string>> = {
  borrow: {
    inc: 'gross yearly income',
    inc2: "partner's gross yearly income",
    dep: 'deposit saved',
    ftb: 'the first-time buyer answer',
    term: 'mortgage term',
  },
  repayment: { loan: 'the mortgage amount', term: 'mortgage years left' },
  deposit: {
    price: 'the home price',
    pc: 'the deposit you need (%)',
    saved: 'savings so far',
    mo: 'monthly saving',
  },
  overpay: { bal: 'mortgage balance', yrs: 'mortgage years left', x: 'the extra each month' },
  ratechange: { loan: 'mortgage balance', term: 'mortgage years left', d: 'the rate change' },
  term: {
    loan: 'the mortgage amount',
    a: 'the first term (your mortgage years left)',
    b: 'the second term',
  },
  rentbuy: {
    rent: 'monthly rent',
    price: 'the home price',
    dep: 'deposit',
    term: 'the mortgage term',
    y: 'the years to compare',
  },
  goalplanner: { t: 'goal amount', y: 'years until the goal', s: 'savings so far' },
  compound: { p: 'starting amount', m: 'monthly addition', y: 'the number of years' },
  lumpsum: { p: 'the amount', y: 'the number of years' },
  emergency: { e: 'essential monthly spending', s: 'easy-access savings' },
  retirement: {
    age: 'age',
    pot: 'pension value today',
    m: 'monthly contributions',
    d: 'desired yearly income in retirement',
  },
  contrib: {
    sal: 'salary',
    inc: 'the extra contribution (% of salary)',
    y: 'years to retirement',
    tr: 'tax rate',
    age: 'age',
    ex: 'yearly pension contributions now',
  },
  avc: {
    m: 'AVC a month',
    sal: 'salary',
    y: 'years to retirement',
    tr: 'tax rate',
    age: 'age',
    ex: 'yearly pension contributions now',
  },
  lastmoney: { pot: 'retirement savings', w: 'yearly withdrawal' },
  drawdown: { pot: 'retirement savings', w: 'yearly withdrawal' },
  realreturn: { p: 'the amount', y: 'the number of years' },
  regularinvest: { m: 'monthly amount', y: 'the number of years' },
  fees: {
    p: 'the amount invested',
    y: 'the number of years',
    a: 'the first fee (fee A)',
    b: 'the second fee (fee B)',
  },
  riskreturn: { p: 'the amount', y: 'the number of years' },
  lifecover: {
    inc: 'gross yearly income',
    mort: 'mortgage balance',
    mp: 'the mortgage protection answer',
    debt: 'other debts',
    sav: 'savings and investments',
    ex: 'existing life cover',
  },
  incomegap: {
    e: 'essential monthly spending',
    sp: 'months of sick pay',
    s: 'easy-access savings',
    inc: 'gross yearly income',
  },
  mortgageprotect: { bal: 'mortgage balance', y: 'mortgage years left' },
  networth: {
    sav: 'savings',
    inv: 'investments',
    pen: 'pension value',
    prop: 'property value',
    mort: 'mortgage balance',
    loans: 'other loans',
  },
  surplus: {
    inc: 'take-home pay',
    ess: 'essential spending',
    life: 'lifestyle spending',
    debt: 'debt repayments',
  },
  budget: { inc: 'take-home pay' },
  debtpay: { b: 'the balance', p: 'monthly payment' },
  loan: { a: 'the loan amount', y: 'the loan term' },
}

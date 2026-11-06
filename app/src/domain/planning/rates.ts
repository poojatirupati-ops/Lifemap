// Irish rules for a plan year: the register with every rule replaced by its value.
import { wholePercent } from '../../lib/format'
import { RULES_2026, type Rule } from './rates.data'
import { createStore } from 'zustand'
import { RULES_2027, type TaxStatus } from './rules2027.data'

// Rules['it']['band'] is a number, and a misspelt rule is a compile error
type Values<T> = T extends Rule<infer V> ? V : { [K in keyof T]: Values<T[K]> }
export type Rules = Values<typeof RULES_2026>

const isRule = (node: unknown): node is Rule =>
  typeof node === 'object' && node !== null && 'value' in node && 'source' in node

function valuesOf(register: object): object {
  const entries = Object.entries(register).map(([key, node]) => [
    key,
    isRule(node) ? structuredClone(node.value) : valuesOf(node),
  ])
  return Object.fromEntries(entries)
}

/** An administrator's 2027 value or status for one rule, for this session. */
export interface TaxOverride {
  value?: unknown
  status?: TaxStatus
}

/** The session's tax-year choices (an adviser's comparison): never saved with the plan. */
export interface TaxSession {
  /** one tax year for every plan year, or null for the plan start year's */
  year: 2026 | 2027 | null
  overrides: Record<string, TaxOverride>
}

export const taxSession = createStore<TaxSession>(() => ({ year: null, overrides: {} }))

/** A typed override counts once it has a value. */
export const hasOverrideValue = (override?: TaxOverride) =>
  override?.value != null && override.value !== ''

function rules2027(overrides: Record<string, TaxOverride>): Rules {
  const rules = valuesOf(RULES_2026) as Record<string, Record<string, unknown>>
  for (const [path, change] of Object.entries(RULES_2027)) {
    const [group, key] = path.split('.')
    const override = overrides[path]
    rules[group][key] = structuredClone(hasOverrideValue(override) ? override!.value : change.value)
  }
  return rules as Rules
}

export const rules2026 = valuesOf(RULES_2026) as Rules
const announced2027 = rules2027({})
// the 2027 rules with a session's overrides, worked out once per set of overrides
const overridden2027 = new WeakMap<object, Rules>()

const VERSIONS = {
  2026: 'Irish rules 2026 · checked 2 Oct 2026, with Budget 2027 changes applied from their dates',
  2027: 'Irish rules 2027 · Budget 2027 (announced 6 Oct 2026), Finance Bill pending',
}

/** The tax year whose rules every plan year uses: the start year's (2026 rules, or Budget 2027 rules from 2027), unless the session forces one. */
export const taxYearFor = (startYear: number, session = taxSession.getState()) =>
  session.year ?? (startYear >= 2027 ? 2027 : 2026)

export function rulesFor(startYear: number, session = taxSession.getState()): Rules {
  if (taxYearFor(startYear, session) === 2026) return rules2026
  const { overrides } = session
  if (!Object.keys(overrides).length) return announced2027
  if (!overridden2027.has(overrides)) overridden2027.set(overrides, rules2027(overrides))
  return overridden2027.get(overrides)!
}

export const rulesVersion = (startYear: number, session = taxSession.getState()) =>
  VERSIONS[taxYearFor(startYear, session)]

export const budget2027Note = (startYear: number, session = taxSession.getState()) =>
  `Tax assumptions: ${startYear}. Includes announced 2027 changes${startYear < 2027 && taxYearFor(startYear, session) !== 2027 ? ' from 1 January 2027' : ''}. Some figures are based on 2026 rates pending publication of updated rules.`

/** The capital gains tax rate on a sale on this ISO date: 33% before 7 Oct 2026, 31% from then. */
export const cgtRateOn = (rules: Rules, isoDate: string) =>
  isoDate >= rules.sav.cgtFrom ? rules.sav.cgt : rules.sav.cgtBefore

// who a guide figure comes from, as the customer sees it
export const guideSource = (key: keyof typeof RULES_2026.guide) => RULES_2026.guide[key].by

const euro = (amount: number) => amount.toLocaleString('en-IE')
const { pen, it, sp, ae, home } = rules2026

// legal limits quoted in copy
export const LAW_TEXT = {
  lumpSum: `up to €${euro(pen.lsTaxFree)} tax-free, the next €${euro(pen.lsCap - pen.lsTaxFree)} taxed at ${wholePercent(pen.lsBandRate)}, and anything above €${euro(pen.lsCap)} taxed at your marginal rate (${wholePercent(it.r2)} here)`,
  arf: `from 61 you must take at least ${wholePercent(pen.arfMin61)} a year (${wholePercent(pen.arfMin71)} from 71)`,
  statePension: `A full State Pension needs ${sp.fullYears} years (${euro(sp.fullYears * 52)} weeks) of PRSI contributions and credits. You need at least ${sp.minYears} years of paid contributions to qualify.`,
  autoEnrolment: `Employees aged ${ae.ageMin}–${ae.ageMax} earning over €${euro(ae.earnMin)} with no pension are enrolled from ${ae.start}: you pay ${ae.ee * 100}% of pay, your employer ${ae.er * 100}% and the State ${ae.state * 100}%.`,
  stampDuty: `${wholePercent(home.stamp[0][1])} up to €${home.stamp[0][0] / 1e6}m`,
}

// how many rules the register holds, and how many still need checking against their source
export function ruleCount() {
  const rules: Rule[] = []
  const collect = (node: object) =>
    Object.values(node).forEach((child) => (isRule(child) ? rules.push(child) : collect(child)))
  collect(RULES_2026)
  return { total: rules.length, toVerify: rules.filter((r) => r.verify).length }
}

// Irish rules for a plan year: the register with every rule replaced by its value.
import { wholePercent } from '../../lib/format'
import { RULES_2026, type Rule } from './rates.data'
import { RULES_2027, UNCHANGED_IN_2027 } from './rules2027.data'

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

function rules2027(): Rules {
  const rules = valuesOf(RULES_2026) as Record<string, Record<string, unknown>>
  for (const [path, change] of Object.entries(RULES_2027)) {
    const [group, key] = path.split('.')
    rules[group][key] = structuredClone(change.value)
  }
  return rules as Rules
}

export const rules2026 = valuesOf(RULES_2026) as Rules

// Budget 2027 rules apply from 2027 onwards
const YEARS = {
  2026: {
    rules: rules2026,
    version:
      'Irish rules 2026 · checked 2 Oct 2026, with Budget 2027 changes already in force (CGT, Help to Buy)',
    note: 'This plan uses 2026 rules. Budget 2027 changes (from 1 January 2027) are available: choose 2027 as the plan start year in Your assumptions.',
  },
  2027: {
    rules: rules2027(),
    version: 'Irish rules 2027 · Budget 2027 (announced 6 Oct 2026), Finance Bill pending',
    note: `This plan uses Budget 2027 rules from 1 January 2027 (announced 6 October 2026). The Finance Bill may still change some details. ${UNCHANGED_IN_2027}`,
  },
}
const planYear = (year: number) => YEARS[year >= 2027 ? 2027 : 2026]

export const rulesFor = (year: number): Rules => planYear(year).rules
export const rulesVersion = (year: number) => planYear(year).version
export const budget2027Note = (year: number) => planYear(year).note

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

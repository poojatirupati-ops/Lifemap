// Settings register (spec 14, 18, 19.6, 27.5): every standard and market rate, with wording, source, label and owner. Pure data and rules.
// Owners: law (fixed, in rates.ts, never editable), standard (LifeMap figure, applied from the start, customer may change),
// market (a suggestion chip, never pre-filled; v:null = no published figure, so no suggestion). Retirement age and plan-until have NO entry: only guidance.
import { RI, RULES_IE_2026 } from './rates.ts'
import { MARKET, STANDARDS, invBy, invNet, type Entry, type Unit } from './settings.data.ts'
export { MARKET, STANDARDS, invBy, invNet } from './settings.data.ts'
export type { Entry, Unit }
export type Partner = { readonly name: string; readonly values: Readonly<Record<string, number | string | readonly number[]>> }
export type Custom = Readonly<Record<string, number | string | readonly number[]>>
export type Resolved = { value: Entry['v'] | undefined; label: string | null; owner: 'law' | 'standard' | 'market' | 'none'; editable: boolean; by?: string }

// Guidance only, never a default: no register entry exists for these (spec 14, 22).
export const NO_STANDARD = ['retireAge', 'planEnd'] as const
export const GUIDANCE = {
  retireAge: { text: 'You can usually draw a pension from 60 (some schemes from 50); State Pension is paid from 66.', src: 'Revenue Commissioners (pension access age); Department of Social Protection (State Pension age)', asat: '2026' },
  planEnd: { text: 'At 65, average life expectancy in Ireland is about 83 for men and 86 for women.', src: 'CSO, Irish Life Tables No. 17, 2015-2017', asat: '2015-2017 (latest edition)' },
} as const

export const T_LAW = 'Set by Government · 2026', T_SET = 'Set by LifeMap', T_MINE = 'Your choice'
const suggestedBy = (p: Partner) => `Suggested by ${p.name}`

// Law values are the leaves of RULES_IE_2026, addressed 'it.band'. Read-only.
function* lawKeys(o: object = RULES_IE_2026, prefix = ''): Generator<string> {
  for (const [k, x] of Object.entries(o)) {
    if ('v' in x && 'src' in x) yield prefix + k
    else yield* lawKeys(x, `${prefix}${k}.`)
  }
}
const LAW = new Set(lawKeys())
export const isLaw = (key: string) => LAW.has(key)
const lawValue = (key: string) => key.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown>)[k], RI) as Entry['v']

const has = (o: object, k: string) => Object.hasOwn(o, k)
const unitOf = (key: string): Unit | undefined =>
  has(STANDARDS, key) ? STANDARDS[key as keyof typeof STANDARDS].u : has(MARKET, key) ? MARKET[key as keyof typeof MARKET].u : (NO_STANDARD as readonly string[]).includes(key) ? 'yrs' : undefined
const num = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x)
// Allowed range per key (ported from the prototype's SETBOUNDS; same units). Applies to choose() and to partner figures, so nobody can flatter a plan.
// retireAge and planEnd (prototype planEnd 50 to 100) are ages in whole years.
export const BOUNDS: Readonly<Record<string, readonly [number, number]>> = {
  infl: [0, 0.06], wage: [0, 0.06], cash: [0, 0.04], inv: [0, 0.06], invGross: [0, 0.08], pen: [0, 0.07], penRet: [0, 0.06], rentRise: [0, 0.08], houseGrow: [0, 0.06], upkeep: [0, 0.03],
  ownShare: [0, 1], retireMult: [15, 40], retireSpend: [0.4, 1], lumpSum: [0, 0.25], safetyMonths: [1, 12], safetyMonthsTwo: [1, 12], cashYears: [1, 10], investShare: [0, 1], cgtGain: [0, 1],
  saveShare: [0, 1], noAnswer: [0, 5000], lifeShare: [0.3, 1], lifeYears: [1, 30], mortRate: [0.005, 0.1], loanRate: [0, 0.3], cardRate: [0, 0.35], depRate: [0, 0.06], buyFees: [0, 50000],
  fundChg: [0, 0.05], waitYears: [0, 20], style: [1, 3], retireAge: [40, 80], planEnd: [50, 100],
}
// Allowed options per choice key (prototype option lists). accessAge is a number, the rest are strings.
const OPTIONS: Readonly<Record<string, readonly (string | number)[]>> = {
  accessAge: [50, 60], bands: ['prices', 'flat'], spGrow: ['prices', 'pay', 'flat'], drawRule: ['spread', 'min', 'fixed'], ddTiming: ['start', 'end'],
}
const EPS = 1e-9 // float noise at a limit (7.2/100 style) must not be refused
const inRange = (key: string, x: number) => !has(BOUNDS, key) || (x >= BOUNDS[key][0] - EPS && x <= BOUNDS[key][1] + EPS)
const WHOLE = new Set(['retireAge', 'planEnd', 'style'])
// pct3 per-element limits (prototype sliders: growth to 8%, ups and downs to 25%); the budget split must also add up to 1.
const P3: Readonly<Record<string, readonly [number, number]>> = { riskMu: [0, 0.08], riskVol: [0, 0.25], budget: [0, 1] }

const valid = (key: string, x: unknown): boolean => {
  const u = unitOf(key)
  if (!u) return false
  if (u === 'choice') return has(OPTIONS, key) && OPTIONS[key].includes(x as string | number)
  if (u === 'pct3') {
    const r = has(P3, key) ? P3[key] : undefined
    return !!r && Array.isArray(x) && x.length === 3 && x.every(n => num(n) && n >= r[0] - EPS && n <= r[1] + EPS) && (key !== 'budget' || Math.abs(x.reduce((a, n) => a + n, 0) - 1) < 1e-6)
  }
  return num(x) && inRange(key, x) && (!WHOLE.has(key) || Number.isInteger(x))
}
const partnerValue = (p: Partner | undefined, k: string) => p && has(p.values, k) && valid(k, p.values[k]) ? p.values[k] : undefined
// Custom is persisted plan data read back at the boundary: a stale or tampered value is ignored.
const customValue = (c: Custom, k: string) => has(c, k) && valid(k, c[k]) ? c[k] : undefined

/** The customer picks their own figure. Law keys, unknown keys and wrong-shaped values are rejected. */
export function choose(custom: Custom, key: string, value: unknown): Custom {
  if (isLaw(key)) throw new Error(`${key} is set by law and cannot be edited`)
  const u = unitOf(key)
  if (!u) throw new Error(`${key} is not a setting`)
  if (!valid(key, value)) throw new Error(`${key} needs a valid ${u} value${has(BOUNDS, key) ? ` from ${BOUNDS[key][0]} to ${BOUNDS[key][1]}` : ''}`)
  return { ...custom, [key]: value as Custom[string] }
}
/** 'Back to LifeMap's figure'. */
export const backToStandard = (custom: Custom, key: string): Custom => Object.fromEntries(Object.entries(custom).filter(([k]) => k !== key))

const owner = (key: string): Resolved['owner'] => has(MARKET, key) ? 'market' : has(STANDARDS, key) ? 'standard' : 'none'

/** What the plan uses for a key and how it is labelled. Standards apply from the start; market rates (inflation too) and the no-standard items resolve to the customer's own figure or nothing. */
export function resolve(key: string, custom: Custom = {}, partner?: Partner): Resolved {
  if (isLaw(key)) return { value: lawValue(key), label: T_LAW, owner: 'law', editable: false }
  if (customValue(custom, key) !== undefined) return { value: custom[key], label: T_MINE, owner: owner(key), editable: true }
  const pv = (k: string) => partnerValue(partner, k)
  if (key === 'inv') {
    // Derived: reads the resolved gross growth and charges, so a partner block (or the customer's own figures) changes it everywhere.
    const gross = resolve('invGross', custom, partner).value as number
    const ch = customValue(custom, 'fundChg') ?? pv('fundChg') ?? MARKET.fundChg.v
    const mine = customValue(custom, 'invGross') !== undefined || customValue(custom, 'fundChg') !== undefined
    const over = mine ? undefined : pv('inv')
    const viaPartner = over !== undefined || pv('invGross') !== undefined || (customValue(custom, 'fundChg') === undefined && pv('fundChg') !== undefined)
    return { value: over ?? invNet(gross, ch as number), label: mine && over === undefined ? T_MINE : viaPartner ? suggestedBy(partner!) : T_SET, owner: 'standard', editable: true, by: over !== undefined ? `a figure from ${partner!.name}` : invBy(gross, ch as number) }
  }
  if (has(STANDARDS, key)) {
    const over = pv(key)
    return over !== undefined ? { value: over, label: suggestedBy(partner!), owner: 'standard', editable: true }
      : { value: STANDARDS[key as keyof typeof STANDARDS].v, label: T_SET, owner: 'standard', editable: true }
  }
  return { value: undefined, label: null, owner: owner(key), editable: true }
}

/** The chip for a market rate: 'Use the suggested rate (X) · label'. null = no published figure. Never pre-fills. */
export function suggestion(key: keyof typeof MARKET, partner?: Partner): { value: number; label: string } | null {
  const over = partnerValue(partner, key)
  if (typeof over === 'number') return { value: over, label: suggestedBy(partner!) }
  const e = MARKET[key]
  return typeof e.v === 'number' ? { value: e.v, label: e.by } : null
}

export type Source = 'document' | 'typed' | 'plan' | 'example'
/** Data precedence: document > typed > plan > example. */
export function pick<T>(s: Partial<Record<Source, T>>): { value: T; from: Source } | null {
  for (const from of ['document', 'typed', 'plan', 'example'] as const) if (s[from] !== undefined) return { value: s[from]!, from }
  return null
}

// Rules, rates and settings must equal the ORIGINAL script's values, run in node:vm.
import { describe, expect, it } from 'vitest'
import { runOriginal } from './origSlice'
import {
  LAW_TEXT,
  budget2027Note,
  guideSource,
  rules2026,
  rulesFor,
  rulesVersion,
  ruleCount,
} from '../../src/domain/planning/rates'
import { RULES_2026 } from '../../src/domain/planning/rates.data'
import { RULES_2027 } from '../../src/domain/planning/rules2027.data'
import {
  cautiousValue,
  defaultSettings,
  guidance,
  investmentGrowth,
  investmentGrowthBasis,
  standardLabel,
  standardSource,
  standardValue,
  type Settings,
  type StandardKey,
} from '../../src/domain/planning/settings'

const original = runOriginal(
  `RULES_IE_2026, RULES_2027, LAW, SETTINGS, SV, SB, SL, SG, invNet, invBy, ruleCount, setRulesYear,
  version: () => RULES_VERSION, b27: () => BUDGET27, snapRI: () => JSON.stringify(RI, (k, v) => (v === Infinity ? 'Inf' : v)), set: (k, v) => { SETTINGS.s[k].pv = v }`,
)
const fresh = structuredClone(defaultSettings)
const plain = (x: any) => JSON.parse(JSON.stringify(x, (k, v) => (v === Infinity ? 'Inf' : v)))

// the original's short field names, mapped to ours
const renamed = (x: any, names: Record<string, string>): any =>
  Array.isArray(x)
    ? x.map((y) => renamed(y, names))
    : x && typeof x === 'object'
      ? Object.fromEntries(Object.entries(x).map(([k, v]) => [names[k] ?? k, renamed(v, names)]))
      : x
const RULE_FIELDS = { v: 'value', src: 'source', eff: 'effective' }
const STANDARD_FIELDS = {
  n: 'name',
  u: 'unit',
  grp: 'group',
  v: 'value',
  pv: 'partnerValue',
  vc: 'cautious',
  src: 'source',
  asat: 'asOf',
}

describe('rules and rates equal the original', () => {
  it('register 2026 and Budget 2027 overlay', () => {
    expect(plain(RULES_2026)).toEqual(renamed(plain(original.RULES_IE_2026), RULE_FIELDS))
    expect(plain(RULES_2027)).toEqual(renamed(plain(original.RULES_2027), RULE_FIELDS))
  })
  it('rules 2026 and 2027, version text, law copy, counts', () => {
    expect(plain(rules2026)).toEqual(JSON.parse(original.snapRI()))
    expect(rulesVersion(2026)).toBe(original.version())
    expect(budget2027Note(2026)).toBe(original.b27())
    expect(Object.values(LAW_TEXT)).toEqual(Object.values(original.LAW))
    const { n, vf } = original.ruleCount()
    expect(ruleCount()).toEqual({ total: n, toVerify: vf })
    expect(guideSource('cardCap')).toBe('Central Bank of Ireland')
    original.setRulesYear(2027)
    expect(plain(rulesFor(2027))).toEqual(JSON.parse(original.snapRI()))
    expect(rulesVersion(2027)).toBe(original.version())
    expect(budget2027Note(2027)).toBe(original.b27())
    original.setRulesYear(2026)
  })
  it('later years reuse the 2027 rules', () => {
    expect(rulesFor(2028)).toBe(rulesFor(2027))
    expect(rulesFor(2026)).toBe(rules2026)
    expect(rulesFor(2027).it.band).toBe(46500)
    // @ts-expect-error a misspelt rule does not compile
    expect(rules2026.it.bnad).toBeUndefined()
  })
})

describe('settings equal the original', () => {
  const same = () => {
    for (const k of Object.keys(original.SETTINGS.s) as StandardKey[]) {
      expect(standardValue(k), k).toEqual(original.SV(k))
      expect(standardSource(k), k).toBe(original.SB(k))
      expect(standardLabel(k), k).toBe(original.SL(k))
      expect(cautiousValue(k), k).toEqual(original.SETTINGS.s[k].vc)
      expect(guidance(k), k).toBe(original.SG(k))
    }
    for (const k of ['riskMu1', 'riskVol3', 'budgetNeeds', 'budgetSave', 'penChg', 'depEarn'])
      expect(guidance(k), k).toBe(original.SG(k))
    expect(investmentGrowth()).toBe(original.invNet(0))
    expect(investmentGrowth(defaultSettings, 0.01)).toBe(original.invNet(0.01))
    expect(investmentGrowthBasis()).toBe(original.invBy())
  }
  it('standards', () => {
    same()
    const guidanceFigures = renamed(plain(original.SETTINGS.g), STANDARD_FIELDS)
    expect(plain(defaultSettings.guidance)).toEqual(guidanceFigures)
  })
  it('every descriptive field matches', () => {
    const ours = plain({ ...defaultSettings.standards, inv: undefined })
    const theirs = renamed(plain({ ...original.SETTINGS.s, inv: undefined }), STANDARD_FIELDS)
    // ours writes verify only where it is true
    for (const standard of Object.values<any>(theirs)) if (!standard.verify) delete standard.verify
    expect(ours).toEqual(theirs)
    const { name, source, guide } = defaultSettings.standards.inv
    const inv = original.SETTINGS.s.inv
    expect({ name, source, guide }).toEqual({ name: inv.n, source: inv.src, guide: inv.guide })
  })
  it('no fundChg figure falls back to the standard charges', () => {
    const settings: Settings = structuredClone(fresh)
    const charges = original.SETTINGS.s.fundChg
    delete (settings.standards as Partial<Settings['standards']>).fundChg
    const keep = charges.v
    charges.v = undefined
    charges.pv = undefined
    expect(investmentGrowth(settings)).toBe(original.invNet(0))
    expect(investmentGrowthBasis(settings)).toBe(original.invBy())
    charges.v = keep
  })
  it('partner overrides', () => {
    defaultSettings.partner = 'Acme CU'
    original.SETTINGS.partner = 'Acme CU'
    for (const [k, v] of [
      ['invGross', 0.06],
      ['fundChg', 0.015],
      ['wage', 0.02],
      ['mortRate', 0.04],
    ] as const) {
      defaultSettings.standards[k].partnerValue = v
      original.set(k, v)
    }
    same()
    Object.assign(defaultSettings, structuredClone(fresh))
  })
})

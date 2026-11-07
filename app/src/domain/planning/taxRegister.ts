// The tax rules register: one row per rule with its 2026 value, its 2027 value or fallback, status,
// source, effective date and last check (original taxRegister). Admin overrides change the 2027 side.
import { hasOverrideValue, rulesVersion, taxSession, type TaxOverride } from './rates'
import { RULES_2026, type Rule } from './rates.data'
import { CANDIDATES_2027, RULES_2027, TAX_STATUS, type TaxStatus } from './rules2027.data'

const CATEGORIES: Record<string, string> = {
  it: 'Income tax',
  usc: 'USC',
  prsi: 'PRSI',
  pen: 'Pensions',
  ae: 'Auto-enrolment',
  sp: 'Social welfare and State Pension',
  sav: 'Savings, investments and CGT',
  home: 'Home',
  infl: 'Inflation',
  guide: 'Guidance',
  ia: 'Investment Account (proposed)',
}

const NAMES: Record<string, string> = {
  'it.band': 'Standard-rate band, single (40% starts above)',
  'it.bandSPCCC': 'Standard-rate band, one-parent family',
  'it.bandMarried': 'Standard-rate band, married one income',
  'it.bandUplift': 'Second-income increase to the band (married two incomes)',
  'it.r1': 'Standard income tax rate',
  'it.r2': 'Higher income tax rate',
  'it.personal': 'Personal tax credit, single',
  'it.personalMarried': 'Personal tax credit, married / civil partners',
  'it.paye': 'Employee (PAYE) tax credit',
  'it.eic': 'Earned Income tax credit',
  'it.homeCarer': 'Home Carer tax credit',
  'it.rent': 'Rent Tax Credit, single',
  'it.rentJoint': 'Rent Tax Credit, couple',
  'it.rentLastYear': 'Last year of the Rent Tax Credit',
  'it.spccc': 'Single Person Child Carer credit',
  'usc.bands': 'USC bands and rates',
  'usc.exempt': 'USC exemption (income up to)',
  'prsi.path': 'PRSI rate path (Class A / S)',
  'prsi.arfApplies': 'PRSI on ARF / PRSA withdrawals (UNRESOLVED)',
  'prsi.arfToAge':
    'PRSI on ARF withdrawals continues to this age without a contributory State Pension (UNRESOLVED)',
  'sp.iqaLimit': "Qualified Adult: partner's own income limit, a week",
  'pen.relief': 'Pension tax relief limits by age',
  'pen.earnCap': 'Pension relief earnings cap',
  'pen.lsMaxPct': 'Retirement lump sum: share of the fund',
  'pen.lsTaxFree': 'Retirement lump sum: tax-free amount',
  'pen.lsCap': 'Retirement lump sum: 20% band ends',
  'pen.lsBandRate': 'Retirement lump sum: rate in the middle band',
  'pen.sft': 'Standard Fund Threshold by year',
  'pen.sftRate': 'Tax above the Standard Fund Threshold',
  'pen.arfMin61': 'ARF minimum withdrawal from 61',
  'pen.arfMin71': 'ARF minimum withdrawal from 71',
  'pen.arfMinBig': 'ARF minimum withdrawal over the large-fund limit',
  'pen.arfBig': 'ARF large-fund limit',
  'sp.week': 'State Pension (Contributory), a week',
  'sp.over80': 'State Pension: extra from 80, a week',
  'sp.qa66': 'Qualified Adult increase, 66 or over, a week',
  'sp.qaUnder66': 'Qualified Adult increase, under 66, a week',
  'sp.illness': 'Illness Benefit, a week',
  'sp.survivor': "Survivor's pension, under 66, a week",
  'sp.survivor66': "Survivor's pension, 66 or over, a week",
  'sp.nonContrib': 'State Pension (Non-Contributory), a week',
  'sp.qaIllness': 'Qualified Adult increase, Illness Benefit, a week',
  'sav.dirt': 'DIRT on deposit interest',
  'sav.exit': 'Exit tax: funds and life policies',
  'sav.deemed': 'Deemed disposal period (years)',
  'sav.cgt': 'Capital gains tax: standard rate from 7 Oct 2026',
  'sav.cgtBefore': 'Capital gains tax: standard rate before 7 Oct 2026',
  'sav.cgtFrom': 'Capital gains tax: new rate starts',
  'sav.cgtDev': 'Capital gains tax: development land',
  'sav.cgtExempt': 'Capital gains tax: yearly exemption per person',
  'sav.cat': 'Gift and inheritance tax: Group A threshold (not in the plan)',
  'home.htbMax': 'Help to Buy: maximum relief',
  'home.stamp': 'Stamp duty rates',
  'ia.start': 'Investment Account: start date',
  'ia.limit': 'Investment Account: yearly contribution limit',
  'ia.taxFreeValue': 'Investment Account: value before the levy',
  'ia.levy': 'Investment Account: yearly levy above that value',
}

// verified by the proposition owner (Oct 2026): the ARF PRSI rule, the CGT exemption, rate and start date
const OWNER_STATUS: Record<string, TaxStatus> = {
  'prsi.arfApplies': TAX_STATUS.verified,
  'prsi.arfToAge': TAX_STATUS.verified,
  'sp.iqaLimit': TAX_STATUS.announced,
  'sav.cgtExempt': TAX_STATUS.verified,
  'sav.cgt': TAX_STATUS.verified,
  'sav.cgtBefore': TAX_STATUS.verified,
  'sav.cgtFrom': TAX_STATUS.verified,
}

const CHECKED_2026 = '2 Oct 2026 (secondary sources; not yet reconciled with Revenue / DSP)'
const CHECKED_2027 = '21 Oct 2026 (Dept of Finance summary and Budget in Brief)'
const UNSURE = /not (confirmed|used)|reference only|sources conflict|unresolved/i

// 'sp.qaUnder66' > 'Qa Under66' when the register has no name for it
const nameOf = (path: string) =>
  NAMES[path] ??
  path
    .split('.')
    .slice(1)
    .join(' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (first) => first.toUpperCase())

function noteOf(path: string, rule: Rule) {
  const change = RULES_2027[path]
  if (change) return change.note
  const candidate = CANDIDATES_2027[path]
  if (candidate)
    return `Not used: ${candidate[1]} (second-hand; the Department of Social Protection table was not opened). The 2026 amount is carried forward.`
  return UNSURE.test(rule.effective) ? rule.effective : ''
}

function row(path: string, rule: Rule, override?: TaxOverride) {
  const change = RULES_2027[path]
  const [group] = path.split('.')
  return {
    path,
    category: CATEGORIES[group] ?? group,
    name: nameOf(path),
    value2026: rule.value,
    value2027: hasOverrideValue(override) ? override!.value : change ? change.value : rule.value,
    fallback: !change && !override,
    status2026: OWNER_STATUS[path] ?? (rule.verify ? TAX_STATUS.toVerify : TAX_STATUS.verified),
    status2027:
      override?.status ??
      change?.status ??
      OWNER_STATUS[path] ??
      (group === 'ia' ? TAX_STATUS.toVerify : TAX_STATUS.fallback),
    effective: change ? change.effective : rule.effective,
    source: change ? change.source : rule.source,
    checked: change ? CHECKED_2027 : CHECKED_2026,
    note: noteOf(path, rule),
    admin: !!override,
  }
}

export type TaxRegisterRow = ReturnType<typeof row>

const isRule = (node: object): node is Rule => 'value' in node && 'source' in node

/** Every rule in the register, in register order. */
export function taxRegister(overrides = taxSession.getState().overrides) {
  const rows: TaxRegisterRow[] = []
  const walk = (node: object, path: string) => {
    for (const [key, child] of Object.entries(node)) {
      const at = path ? `${path}.${key}` : key
      if (isRule(child)) rows.push(row(at, child, overrides[at]))
      else walk(child, at)
    }
  }
  walk(RULES_2026, '')
  return rows
}

/** The tax rules a plan version used: kept with each version in the plan history. */
export function taxSnapshot(startYear: number, session = taxSession.getState()) {
  const rows = taxRegister(session.overrides)
  const count = (test: (row: TaxRegisterRow) => boolean) => rows.filter(test).length
  return {
    startYear,
    override: session.year,
    rules: rulesVersion(startYear, session),
    announced: count((row) => row.status2027 === TAX_STATUS.announced),
    fallback: count((row) => row.status2027 === TAX_STATUS.fallback),
    needsCheck: count(
      (row) => row.status2027 === TAX_STATUS.toVerify || row.status2026 === TAX_STATUS.toVerify,
    ),
  }
}

export type TaxSnapshot = ReturnType<typeof taxSnapshot>

// project(), honest goal funding and what-if must equal the ORIGINAL script's, run in node:vm,
// on every fixture and on seeded random plans (the same plan goes to both sides).
import { describe, expect, it } from 'vitest'
import { runOriginal } from './origSlice'
import { fixtures, plain } from './origProfile'
import { livingShort, project } from '../../src/domain/planning/project'
import { planSettings } from '../../src/domain/planning/planSettings'
import { extraNeededFor, whatIfFrom } from '../../src/domain/planning/wi'
import { stressTest } from '../../src/domain/planning/stress'
import { fromOriginal } from '../../src/state/migrate'
import { chooser, prepared as preparedBy } from './helpers'

const original = runOriginal('applyAssume, syncLists, autoSafety, project, extraFor, stressInfo')

// the original's state after what it runs before project()
const prepared = (state: any) => preparedBy(original, state)

const ROW_NAMES: Record<string, string> = {
  index: 't',
  age: 'a',
  year: 'yr',
  repayments: 'fixed',
  goalsDue: 'dueG',
  livingShortfall: 'shortLiving',
  shortfall: 'short',
  drawnFromSavings: 'used',
  pension: 'pen',
  retiresThisYear: 'rmark',
  downsized: 'downIn',
  exitTaxDeemed: 'exitDeemed',
  cashflow: 'cf',
}
const CASHFLOW_NAMES: Record<string, string> = {
  lumpSumTax: 'lumpTax',
  sftTax: 'sft',
  pay: 'emp',
  partnerPay: 'pemp',
  statePension: 'sp',
  drawdown: 'draw',
  otherIncome: 'other',
  incomeTax: 'it',
  contributions: 'cashOut',
  balances: 'bal',
}
const TAX_USED_NAMES: Record<string, string> = {
  year: 'yr',
  personalCredit: 'credit',
  usc2Band: 'usc2',
  statePensionWeek: 'sp',
  exitTax: 'exit',
  cgtRate: 'cgt',
  cgtExemption: 'cgtExempt',
  bandsIndex: 'index',
}
const GOAL_NAMES: Record<string, string> = {
  savedSoFar: 'saved0',
  fromAssets: 'src0',
  fromAssetsWhenDue: 'srcDue',
  neededMonthly: 'needM',
  savingMonthly: 'nowM',
  averageMonthly: 'avgM',
}
const SOURCE_NAMES: Record<string, string> = {
  savings: 'sav',
  invest: 'inv',
  otherAssets: 'oth',
  alternatives: 'alt',
}
const rename = (object, names: Record<string, string>) =>
  Object.fromEntries(Object.entries(object).map(([key, value]) => [names[key] ?? key, value]))

// our result in the original's shape; fields no screen reads are derived here
function asOriginal(result: ReturnType<typeof project>, plan: any) {
  const { policyLumpSum, policyLumpSumAge } = planSettings(plan).figures
  const policyPaysOut = (age: number) =>
    policyLumpSum > 0 && policyLumpSumAge > 0 && age === policyLumpSumAge
  const goal = Object.fromEntries(
    Object.entries(result.goals).map(([id, funding]) => {
      const named = rename(funding, GOAL_NAMES)
      named.src0 = rename(funding.fromAssets, SOURCE_NAMES)
      named.srcDue = rename(funding.fromAssetsWhenDue, SOURCE_NAMES)
      return [id, named]
    }),
  )
  const rows = result.rows.map(({ goalShort, ...row }) => {
    const named = rename(goalShort ? { ...row, goalShort } : row, ROW_NAMES)
    named.due = row.goalsDue.map((goal) => goal.name)
    named.goalPaid = row.goalsDue.reduce(
      (total, goal) => total + (goal.kind === 'pot' ? 0 : goal.paid),
      0,
    )
    named.polIn = policyPaysOut(row.age) ? policyLumpSum : 0
    named.cf = rename(row.cashflow, CASHFLOW_NAMES)
    named.cf.sold = rename(row.cashflow.sold, SOURCE_NAMES)
    named.cf.bal = rename(row.cashflow.balances, { ...SOURCE_NAMES, emergency: 'buffer' })
    return named
  })
  const { spareMonthly, savingMonthly, ruleMonthly } = result.saving
  return {
    rows,
    pct: result.percent,
    goal,
    taxUsed: result.taxUsed.map((year) => rename(year, TAX_USED_NAMES)),
    taxEvents: result.taxEvents,
    save: { surplusM: spareMonthly, saveM: savingMonthly, autoM: ruleMonthly },
  }
}

/** Deep equal, numbers to 1e-9 relative; returns the first difference. */
function difference(ours: any, theirs: any, path = ''): string | null {
  if (typeof ours === 'number' && typeof theirs === 'number') {
    const close = Math.abs(ours - theirs) <= 1e-9 * Math.max(1, Math.abs(theirs))
    return close || (Number.isNaN(ours) && Number.isNaN(theirs))
      ? null
      : `${path}: ${ours} vs ${theirs}`
  }
  if (ours && theirs && typeof ours === 'object' && typeof theirs === 'object') {
    const keys = new Set([...Object.keys(ours), ...Object.keys(theirs)])
    for (const key of keys) {
      const found = difference(ours[key], theirs[key], `${path}.${key}`)
      if (found) return found
    }
    return null
  }
  return ours === theirs ? null : `${path}: ${JSON.stringify(ours)} vs ${JSON.stringify(theirs)}`
}

function compare(state: any, stress = false) {
  const plan: any = fromOriginal(prepared(state))
  const theirs = plain(original.project({ ...state.wi, stress }))
  // payN (saved from spare money) has no reader in the app
  for (const goal of Object.values<any>(theirs.goal)) delete goal.payN
  const whatIf = { ...whatIfFrom(plan.whatIf), stress }
  const ours = plain(asOriginal(project(plan, whatIf), plan))
  expect(difference(ours, theirs)).toBeNull()
}

const base = fixtures.find(([name]) => name === 'finances-complete.json')![1]

function randomPlan(seed: number) {
  const { pick, between } = chooser(seed)
  const s = structuredClone(base)
  s.assume = pick('standard', 'cautious')
  s.infl = pick(0.01, 0.02, 0.035)
  s.ans['6'] = pick(0, 1, 2, 3, 4, undefined)
  s.saveM = pick(null, between(0, 1500))
  s.saveUp = pick(undefined, true, false)
  s.penExtra = pick(0, 0, 150)
  s.retireAge = between(50, 68)
  s.pRetSet = pick(true, false)
  s.pRet = between(55, 70)
  Object.assign(s.asm, {
    planEnd: between(80, 100),
    startYear: pick(2026, 2027),
    drawRule: pick(null, 'min', 'fixed', 'spread'),
    drawFixed: pick(null, 30000),
    spGrow: pick(null, 'pay', 'flat', 'prices'),
    bands: pick(null, 'flat', 'prices'),
    lumpSum: pick(null, 0, 0.1),
    accessAge: pick(null, 50, 60),
    investShare: pick(null, 0, 0.8),
    cgtGain: pick(null, 0.2),
    retireSpend: pick(null, 0.6),
    cashYears: pick(null, 3),
    saveShare: pick(null, 0.3),
    noAnswer: pick(null, 600),
    safetyMonths: pick(null, 3),
    wage: pick(null, 0.02),
  })
  Object.assign(s.fin, {
    income: between(0, 150000),
    work: pick('Employed', 'Employed', 'Self-employed', 'Not working'),
    costsM: between(1000, 6000),
    cash: between(0, 80000),
    savings: pick(0, between(0, 40000)),
    invest: between(0, 100000),
    otherAssets: pick(0, between(0, 60000)),
    altInv: pick(0, between(0, 30000)),
    pension: between(0, 400000),
    pensionM: pick(0, between(100, 1500)),
    penChg: pick('', 0.5),
    mortBal: pick(0, between(50000, 300000)),
    cardBal: pick(0, between(0, 8000)),
    loanBal: pick(0, between(0, 20000)),
    polLump: pick(0, 50000),
    polLumpAge: between(40, 70),
    polInc: pick(0, 6000),
    polIncAge: between(55, 75),
    homeUse: pick('No, never', "Yes, I'd downsize"),
    downAge: between(55, 80),
    downValue: between(150000, 300000),
    pSp: pick('Own full', 'Not sure', 'Qualified adult increase', 'None'),
  })
  s.about.partner = pick(true, true, false)
  s.about.cred = pick({}, { rent: true }, { carer: true })
  for (const goal of s.goals) {
    goal.age = goal.kind === 'retire' ? s.retireAge : between(35, 100)
    goal.amount = between(1000, 200000)
    goal.saved = pick(0, between(0, 20000))
    goal.prio = pick('Must have', 'Nice to have')
  }
  s.goals.push(
    { ...s.goals[0], id: 90, k: 'wealth', kind: 'pot', name: 'Grow wealth', age: between(45, 70) },
    { ...s.goals[0], id: 91, k: 'legacy', kind: 'legacy', name: 'Leave money', age: 95 },
  )
  if (pick(true, false)) s.goals = s.goals.filter((goal: any) => goal.k !== 'safety')
  const ids = s.goals.map((goal: any) => goal.id)
  s.rank = pick(null, [], ids.slice().reverse(), ids.slice(1, 3))
  const goal = pick(...s.goals)
  s.wi = pick({ g: null, m: 0, l: 0 }, { g: goal.id, m: pick(-200, 150, 600), l: pick(0, 20000) })
  // what was paid for each holding, losses, joint ownership, rent costs, dividends, how investments are held
  Object.assign(s.fin, {
    invCost: pick('', between(0, 150000)),
    invYears: pick('', between(0, 20)),
    othCost: pick('', between(0, 90000)),
    altCost: pick('', between(0, 40000)),
    capLoss: pick(0, between(0, 20000)),
    assetsJoint: pick('Yes', 'No'),
    rentM: pick(0, between(500, 2500)),
    rentCostM: pick(0, between(0, 3000)),
    divY: pick(0, between(0, 4000)),
  })
  Object.assign(s.asm, { invWrapper: pick(null, 'fund', 'shares'), inv: pick(null, null, 0.04) })
  return s
}

describe('project() equals the original', { timeout: 30_000 }, () => {
  it.each(fixtures)('%s', (_, state) => compare(state))
  it.each(Array.from({ length: 200 }, (_, seed) => seed + 1))('random plan, seed %i', (seed) =>
    compare(randomPlan(seed)),
  )
})

describe('the stress test equals the original', { timeout: 30_000 }, () => {
  it.each(Array.from({ length: 40 }, (_, seed) => seed + 1))('random plan, seed %i', (seed) => {
    const state = randomPlan(seed)
    compare(state, true)
    const plan: any = fromOriginal(prepared(state))
    const { index, potAtRetirement, potAtRetirementBase, ...ours } = stressTest(
      plan,
      whatIfFrom(plan.whatIf),
    )
    const { t, potAtRet, potAtRetBase, ...theirs } = plain(original.stressInfo(state.wi))
    expect(
      plain({ t: index, potAtRet: potAtRetirement, potAtRetBase: potAtRetirementBase, ...ours }),
    ).toEqual({ t, potAtRet, potAtRetBase, ...theirs })
  })
})

describe('the extra a month a goal needs equals the original', { timeout: 30_000 }, () => {
  it.each(Array.from({ length: 16 }, (_, seed) => seed + 1))('random plan, seed %i', (seed) => {
    const theirs = prepared(randomPlan(seed))
    const plan: any = fromOriginal(theirs)
    plan.goals.forEach((goal: any, index: number) => {
      if (goal.kind !== 'legacy')
        expect(extraNeededFor(plan, goal)).toBe(original.extraFor(theirs.goals[index]))
    })
  })
})

describe('edges the random plans rarely reach', { timeout: 30_000 }, () => {
  it('your saving set just below the rule still counts as raised', () => {
    const state = randomPlan(5)
    state.saveM = null
    const ruleToday = original.project(prepared(state).wi).save.autoM
    for (const saveM of [ruleToday - 0.3, ruleToday - 0.7])
      compare({ ...state, saveM, saveUp: undefined })
  })

  it('the extra a month for goals of rising cost lands on each step as the original', () => {
    const state = structuredClone(base)
    state.goals = state.goals.filter((goal: any) => goal.k !== 'edu')
    state.fin.income = 400000
    const found = new Set()
    for (let amount = 10000; amount <= 1000000; amount += 15000) {
      state.goals[0] = { ...state.goals[0], kind: 'spend', amount, age: 50 }
      const theirs = prepared(state)
      const plan: any = fromOriginal(theirs)
      const extra = original.extraFor(theirs.goals[0])
      expect(extraNeededFor(plan, plan.goals[0])).toBe(extra)
      found.add(extra)
    }
    expect(found.size).toBeGreaterThan(10)
  }, 60000)

  it('a retired year is short above €500 or 2% of what it needs', () => {
    expect(livingShort({ livingShortfall: 900, needs: 40000 })).toBe(true)
    expect(livingShort({ livingShortfall: 700, needs: 40000 })).toBe(false)
    expect(livingShort({ livingShortfall: 499, needs: 1000 })).toBe(false)
  })
})

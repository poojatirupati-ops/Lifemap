// Home's foundations and next best step must equal the ORIGINAL script's, run in node:vm.
import { describe, expect, it } from 'vitest'
import { runOriginal } from '../golden/origSlice'
import { fixtures, plain } from '../golden/origProfile'
import { project } from '../../src/domain/planning/project'
import { foundations, type Check } from '../../src/components/home/foundations'
import { monthsToClear } from '../../src/components/home/protection'
import { homeSummary } from '../../src/components/home/useHome'

const original = runOriginal('applyAssume, syncLists, autoSafety, foundations, fndNext, nextStep')

function prepared(state: any) {
  original.setState(structuredClone(state))
  original.applyAssume()
  original.syncLists()
  original.autoSafety()
  return structuredClone(original.getState())
}

const asCheck = ({ status, text, tool, section }: Check) =>
  ({ st: status, s: text, a: tool, sec: section }) as Record<string, unknown>

function ours(plan: any) {
  const levels = foundations(plan, project(plan))
  const asOriginal = levels.map(({ level, emoji, name, months, makePlan, checks, ...check }) => ({
    n: level,
    e: emoji,
    name,
    m: months,
    make: makePlan ? 1 : undefined,
    items: checks?.map(asCheck),
    ...asCheck(check),
  }))
  const { step } = homeSummary(plan)
  return { levels: asOriginal, step }
}

const ACTION_A = {
  looks: 'me',
  foundation: 'sheet',
  profile: 'toprofile',
  whatIf: 'gowi',
  book: 'book',
  meeting: 'tab',
}

function compare(state: any) {
  const plan = prepared(state)
  const theirs = plain(original.foundations())
  const mine = ours(plan)
  // the original keeps the pre-"held" text as s0 and the protection rows' key order differs
  for (const level of theirs) delete level.s0
  for (const level of theirs) for (const key of ['sp', 'net', 'on', 'of']) delete level[key]
  expect(plain(mine.levels)).toEqual(theirs)
  const step = original.nextStep()
  expect([mine.step.emoji, mine.step.title, mine.step.button, ACTION_A[mine.step.action]]).toEqual([
    step.e,
    step.t.replace(/&#39;/g, "'"),
    step.b,
    step.a,
  ])
}

function random(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const sample = fixtures.find(([name]) => name === 'sample-home.json')![1]

function randomPlan(seed: number) {
  const next = random(seed)
  const pick = <T>(...options: T[]) => options[Math.floor(next() * options.length)]
  const between = (low: number, high: number) => Math.round(low + next() * (high - low))
  const s = structuredClone(sample)
  const typed = (key: string, value: unknown) => {
    if (value === undefined) {
      delete s.fin[key]
      delete s.src[key]
    } else {
      s.fin[key] = value
      s.src[key] = 'typed'
    }
  }
  typed('income', pick(undefined, 0, between(20000, 120000)))
  typed('work', pick('Employed', 'Not working', 'Self-employed'))
  typed('costsM', pick(undefined, between(1000, 9000)))
  typed('cash', pick(undefined, 0, between(0, 60000)))
  typed('invest', pick(undefined, 0, between(0, 60000)))
  typed('pensionM', pick(undefined, 0, 400))
  typed('cardBal', pick(undefined, 0, between(0, 9000)))
  typed('cardPayM', pick(undefined, 0, between(0, 600)))
  typed('loanBal', pick(undefined, 0, between(0, 30000)))
  typed('loanPayM', pick(undefined, 0, between(0, 900)))
  typed('life', pick(undefined, 'Yes', 'No', 'Not sure'))
  typed('workCover', pick(undefined, 'Yes', 'No'))
  typed('ip', pick(undefined, 'Yes', 'No'))
  s.about.partner = pick(true, false)
  s.about.deps = pick(0, 2)
  s.um.a.u14 = pick(undefined, 0, 1, 2, 3)
  s.app = pick(true, true, false)
  s.pref = pick(null, s.wi)
  s.book.done = pick(false, true)
  s.book.slot = 'Tue 3 Nov · 10:00'
  if (pick(true, false)) s.goals = s.goals.filter((goal: any) => goal.k !== 'safety')
  if (pick(true, false)) s.um.a = {}
  return s
}

describe('foundations and next step equal the original', () => {
  it.each(fixtures)('%s', (_, state) => compare(state))
  it.each(Array.from({ length: 150 }, (_, seed) => seed + 1))('random plan, seed %i', (seed) =>
    compare(randomPlan(seed)),
  )
})

describe('months to clear a debt', () => {
  it('never clears when the repayment only covers interest', () => {
    expect(monthsToClear(1000, 0.2, 0)).toBe(Infinity)
    expect(monthsToClear(1000, 0.2, 10)).toBe(Infinity)
  })
  it('clears without interest in balance ÷ repayment months', () =>
    expect(monthsToClear(1000, 0, 100)).toBe(10))
})

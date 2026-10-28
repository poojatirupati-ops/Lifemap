import { expect, test } from 'vitest'
import { retireRules, retireYears, type Person } from './retire'

const Y0 = 2026
const p = (retireAge: number, extra: Partial<Person> = {}): Person => ({ dob: { y: 1996, m: 6, d: 15 }, retireAge, planUntil: 90, ...extra })   // age 30 in 2026

test('bounds never invert: age 89, plan until 90', () => {
  const r = retireRules({ dob: { y: 1937, m: 6, d: 15 }, retireAge: 90, planUntil: 90 }, Y0)
  expect([r.min, r.max, r.ok]).toEqual([90, 90, true])
})

test('ages 40 45 50 55 60 66 75: notes, bridge years, bounds', () => {
  const want = [[40, 'n', 20], [45, 'n', 15], [50, 'n', 10], [55, 'n', 5], [60, null, 0], [66, null, 0], [75, null, 0]] as const
  for (const [age, note, bridge] of want) {
    const r = retireRules(p(age), Y0)
    expect(r.ok).toBe(true)
    expect([r.min, r.max]).toEqual([31, 89])
    expect(r.bridgeYears).toBe(bridge)
    expect(r.note === null).toBe(note === null)
  }
  const own = 'Pensions can usually be drawn from 60 (some schemes from 50) and the State Pension from 66, so until then your plan uses savings and other income. Your results will show any gap honestly.'
  expect(retireRules(p(40), Y0).note).toBe(`Retiring before 50 is possible. ${own}`)
  expect(retireRules(p(40, { scheme50: true }), Y0).note).toBe(`Retiring before 50 is possible. ${own}`)
  expect(retireRules(p(55), Y0).note).toBe(own)
  expect(retireRules(p(55, { scheme50: true }), Y0).note).toBe(own)   // below 60 still gets the note
  expect(retireRules(p(60), Y0).note).toBeNull()
})

test('scheme from 50 shortens the bridge; bounds flag but never throw', () => {
  expect(retireRules(p(45, { scheme50: true }), Y0).bridgeYears).toBe(5)
  expect(retireRules(p(55, { scheme50: true }), Y0).bridgeYears).toBe(0)
  expect(retireRules(p(30), Y0).ok).toBe(false)     // not after today's age
  expect(retireRules(p(90), Y0).ok).toBe(false)     // not before plan-until
  expect([31, 89].map(a => retireRules(p(a), Y0).ok)).toEqual([true, true])
})

test('calendar years: income stops in the retirement year, pension at 60, State Pension at 66', () => {
  const rows = [...retireYears(p(55), Y0)], at = (age: number) => rows.find(r => r.age === age)!
  expect(at(54).working).toBe(true)
  expect(at(55)).toMatchObject({ working: false, bridge: true, pension: false })
  expect(at(60)).toMatchObject({ bridge: false, pension: true, statePension: false })
  expect(at(66).statePension).toBe(true)
  expect(rows.at(-1)!.age).toBe(90)
  expect(rows.filter(r => r.bridge)).toHaveLength(5)
})

test('partner at every age: own note wording, bridge to State Pension, income stop, State Pension year', () => {
  const dob = { y: 1990, m: 1, d: 1 }          // age 36 in 2026, so 40..75 are all allowed
  const gap = 'Your results will show any gap honestly.'
  const lo = 'Their pay stops at this age. Until their State Pension at 66 your plan uses savings and other income, and the results will show any gap honestly.'
  const mid = `Their pay stops at this age. Their own pension is not modelled, so until their State Pension at 66 your plan relies on savings and other income. ${gap}`
  for (const age of [40, 45, 50, 55, 60, 66, 75]) {
    const partner = p(age, { dob, partner: true }), r = retireRules(partner, Y0)
    expect(r).toMatchObject({ ok: true, min: 37, accessAge: 66, bridgeYears: Math.max(0, 66 - age) })
    expect(r.note).toBe(age < 50 ? lo : age < 60 ? mid : null)
    const rows = [...retireYears(partner, Y0)]
    expect(rows.find(x => x.age === age)!.working).toBe(false)
    const before = rows.find(x => x.age === age - 1)
    expect(before).toBeDefined()
    expect(before!.working).toBe(true)
    expect(rows.find(x => x.statePension)).toMatchObject({ age: 66, year: 1990 + 66 })
    expect(rows.filter(x => x.bridge)).toHaveLength(r.bridgeYears)
  }
})

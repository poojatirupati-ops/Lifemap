import { expect, test } from 'vitest'
import { migrate } from './migrate.ts'
import { defaultPlan } from './types.ts'

const v1 = {
  why: ['a'], goals: [{ id: 1, name: 'Car' }], gid: 2, iid: 5, infl: 0.03, rank: [1],
  about: { age: 41, partner: true, deps: 2, married: false },
  retireAge: 60, retireSet: true, pRet: 62, pRetSet: false,
  fin: { income: 5000 }, acct: { name: 'A', email: 'a@b.ie', mobile: '', c1: true, c2: false, ev: true, sv: false, pk: false },
}

test('v1 blob migrates to v2 without data loss', () => {
  const p = migrate(v1, 1)
  expect(p.why).toEqual(['a'])
  expect(p.iid).toBe(5)
  expect(p.infl).toBe(0.03)
  expect(p.rank).toEqual([1])
  expect(p.fin).toEqual({ income: 5000 })
  expect(p.acct.c1).toBe(true)
  expect(p.about).toEqual({ partner: true, deps: 2, married: false, legacyAge: 41 })
  expect(p.retireAge).toBe(60)          // chosen in v1 (retireSet)
  expect(p.partnerRetireAge).toBeNull() // pRetSet false: was only a default
  expect(p.dob).toBeNull()
  expect(p).not.toHaveProperty('retireSet')
})

test('unchosen v1 retirement age becomes null', () => {
  expect(migrate({ ...v1, retireSet: false }, 1).retireAge).toBeNull()
})

test('corrupt blob falls back to defaults; required choices default to null', () => {
  for (const bad of [null, 'x', 7, [1], { retireAge: 'soon', planUntil: '90', infl: 'abc', goals: 'x' }]) {
    const p = migrate(bad, 1)
    expect(p).toEqual(defaultPlan())
    expect([p.retireAge, p.planUntil, p.infl, p.partnerRetireAge]).toEqual([null, null, null, null])
  }
})

test('v2 keeps valid new fields', () => {
  const p = migrate({ dob: '1990-05-01', planUntil: 90, builderStep: 3, fromPublic: true, sustainability: 'yes' })
  expect([p.dob, p.planUntil, p.builderStep, p.fromPublic, p.sustainability]).toEqual(['1990-05-01', 90, 3, true, 'yes'])
})

test('junk dob, sustainability, builderStep and consent flags fall back', () => {
  const p = migrate({ dob: 'banana', partnerDob: '2020-13-45', sustainability: 'zzz', builderStep: -4.5, privacy: { analytics: 'yes' } })
  expect([p.dob, p.partnerDob, p.sustainability, p.builderStep]).toEqual([null, null, null, 0])
  expect(p.privacy).toEqual({ analytics: false, marketing: false })
  expect(migrate({ privacy: {} }).privacy).toEqual({ analytics: false, marketing: false })
  expect(migrate({ privacy: { marketing: true } }).privacy).toEqual({ analytics: false, marketing: true })
  expect(migrate({ builderStep: 2.5 }).builderStep).toBe(0)
  // calendar-impossible dates (Chrome rolls them over, Safari/Firefox give NaN) and a real leap day
  expect([migrate({ dob: '2023-02-30' }).dob, migrate({ dob: '2020-02-31' }).dob, migrate({ dob: '2024-02-29' }).dob]).toEqual([null, null, '2024-02-29'])
})

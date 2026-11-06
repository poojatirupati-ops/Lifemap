import { afterEach, expect, test } from 'vitest'
import { assumption } from '../../src/domain/planning/assumptions'
import { taxSession } from '../../src/domain/planning/rates'
import { fresh } from '../../src/state/fresh'
import { addVersion } from '../../src/state/versions'

const pinned = globalThis as { __TODAY?: string }

afterEach(() => {
  delete pinned.__TODAY
  taxSession.setState(taxSession.getInitialState(), true)
})

test('a plan starts in its own year, never before 2026', () => {
  for (const [today, year] of [
    ['2025-06-01', 2026],
    ['2026-11-06', 2026],
    ['2028-02-01', 2028],
  ] as const) {
    pinned.__TODAY = today
    expect(assumption(fresh(), 'startYear')).toBe(year)
  }
})

test("a saved version keeps the plan's tax rules, not the session's comparison", () => {
  const plan = fresh()
  addVersion(plan, 'Plain')
  taxSession.setState({ year: 2027, overrides: { 'it.band': { value: 1, status: 'Verified' } } })
  addVersion(plan, 'During a comparison')
  const [plain, compared] = plan.versions.map((version) => version.tax)
  expect(compared).toEqual(plain)
  expect(compared?.override).toBeNull()
})

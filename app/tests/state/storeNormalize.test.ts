// The store alone (nothing else imported) runs syncAges and syncSafety, not just the list totals.
import { expect, it } from 'vitest'
import { useStore } from '../../src/state/store'

it('store.update runs syncAges and syncSafety', () => {
  useStore.getState().update((s) => {
    s.about.dob = { day: '21', month: '8', year: '1989' }
    s.sources.costsM = 'typed'
    s.figures.costsM = 2000
    s.goals.push({ id: 9, key: 'safety', auto: true, amount: 1, kind: 'pot', age: 40 } as never)
  })
  const s = useStore.getState().plan
  expect(s.about.age).toBeGreaterThanOrEqual(2026 - 1989) // plan-year age from the date of birth
  expect(s.about.ageToday).toBeTypeOf('number')
  expect(s.goals[0].amount).toBe(2000 * 6) // months x essential spending
})

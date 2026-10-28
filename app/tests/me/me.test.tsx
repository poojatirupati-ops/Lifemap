// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, expect, test, vi } from 'vitest'
import { useStore } from '../../src/state/store.ts'
import type { Snapshot } from '../../src/state/types.ts'
import sample from '../fixtures/sample-me.json'
import * as Me from '../../src/screens/Me.screen.tsx'
import * as Recheck from '../../src/screens/MeRecheck.screen.tsx'
import * as Section from '../../src/screens/MeProfileSection.screen.tsx'
import AssumptionField from '../../src/components/me/AssumptionField.tsx'
import { formatAssumption, valueInUse } from '../../src/components/me/assumptionText.ts'
import type { MePlan } from '../../src/components/me/mePlan.ts'

const auth = vi.hoisted(() => ({
  signOut: vi.fn(async () => {}),
  postConsents: vi.fn(async () => {}),
  user: null as { email: string } | null,
}))
vi.mock('../../src/auth/useWall.ts', () => ({ signOut: auth.signOut }))
vi.mock('../../src/auth/planSync.ts', () => ({ postConsents: auth.postConsents }))
vi.mock('../../src/auth/client.ts', () => ({
  authClient: { useSession: () => ({ data: auth.user && { user: auth.user } }) },
}))

const plan = () => useStore.getState().plan as MePlan
const open = (page: string) => useStore.getState().update((p) => void (p.me = page))

beforeEach(() => {
  vi.clearAllMocks()
  auth.user = null
  useStore.getState().load(structuredClone(sample) as unknown as Snapshot)
})

test('the hub opens its pages; sign out shows only with a session', () => {
  const { rerender } = render(<Me.Body />)
  expect(screen.queryByText('Sign out')).toBeNull()
  fireEvent.click(screen.getByText('Privacy & preferences'))
  expect(plan().me).toBe('privacy')
  expect(Me.id(plan())).toBe('ME-PRIV')

  open('home')
  auth.user = { email: 'aoife@example.ie' }
  rerender(<Me.Body />)
  fireEvent.click(screen.getByText('Sign out'))
  expect(auth.signOut).toHaveBeenCalled()
})

test('privacy: reminders are recorded both ways, export and delete are offered', () => {
  open('privacy')
  render(<Me.Body />)
  fireEvent.click(screen.getByText('Send me reminders and updates'))
  expect(plan().acct.c2).toBe(true)
  expect(auth.postConsents).toHaveBeenCalledWith({ terms: true, marketing: true })
  expect(screen.getByText('Download my data').getAttribute('href')).toBe('/api/me/export')
  fireEvent.click(screen.getByText('Delete my data'))
  expect(useStore.getState().sheet).toBe('delete')
})

test('recheck confirms the first answers; only pages with a foot get one', () => {
  expect(Me.footFor(plan())).toBeUndefined()
  open('recheck')
  expect(Me.footFor(plan())).toBe(Recheck.Foot)
  render(<Recheck.Foot />)
  fireEvent.click(screen.getByText('These still look right'))
  expect(plan()).toMatchObject({ me: 'home', um: { rechecked: true } })
})

test('saving a profile section marks it done and fills an unanswered horizon', () => {
  useStore.getState().update((p) => {
    p.me = 'ums'
    p.um.sec = 1
  })
  expect(Me.id(plan())).toBe('ME-UM1')
  render(<Section.Foot />)
  fireEvent.click(screen.getByText('Save this section'))
  expect(plan().um.done[1]).toBe(true)
  expect(plan().um.a.u9).toBeTypeOf('number')
  expect(plan().me).toBe('um')
})

test('an assumption typed as a percent is kept as a fraction, and Back restores the standard', () => {
  render(<AssumptionField name="wage" />)
  const box = document.querySelector('[data-nb="asm|wage"]') as HTMLInputElement
  fireEvent.input(box, { target: { value: '9' } })
  expect(plan().asm.wage).toBe(0.06) // capped at the 6% maximum
  expect(screen.getByText('Max 6%')).toBeTruthy()
  fireEvent.click(screen.getByText(/^Back to LifeMap's figure/))
  expect(plan().asm.wage).toBeUndefined()
  expect(valueInUse(plan(), 'wage')).toBeTypeOf('number')
})

test('assumption values read as words', () => {
  expect(formatAssumption('retireMult', 25)).toBe('25× (about 4% a year)')
  expect(formatAssumption('safetyMonths', 1)).toBe('1 month')
  expect(formatAssumption('spWeek', 299.3)).toBe('€299.30 a week')
  expect(formatAssumption('drawRule', 'min')).toBe('Minimum only (4% / 5%)')
  expect(formatAssumption('cashYears', null)).toBe('Not chosen yet')
})

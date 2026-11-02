// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, expect, test, vi } from 'vitest'
import { useStore } from '../../src/state/store.ts'
import type { Snapshot } from '../../src/state/types.ts'
import sample from '../fixtures/sample-me.json'
import { useShell } from '../../src/state/shell.ts'
import { path, renderAt, settle } from '../renderAt.tsx'
import AssumptionField from '../../src/components/me/AssumptionField.tsx'
import { formatAssumption, valueInUse } from '../../src/domain/planning/assumptionText.ts'
import type { MePlan } from '../../src/components/me/mePlan.ts'

const auth = vi.hoisted(() => ({
  signOut: vi.fn(async () => {}),
  postConsents: vi.fn(async () => {}),
  user: null as { email: string } | null,
}))
vi.mock('../../src/auth/session.ts', () => ({ signOut: auth.signOut }))
vi.mock('../../src/auth/consents.ts', () => ({ postConsents: auth.postConsents }))
vi.mock('../../src/auth/client.ts', () => ({
  authClient: {
    useSession: () => ({ data: auth.user && { user: auth.user } }),
    useListPasskeys: () => ({ data: [] }),
    useActiveMember: () => ({ data: null }),
  },
}))

const plan = () => useStore.getState().plan as MePlan
const screenId = () => useShell.getState().screenId

beforeEach(() => {
  vi.clearAllMocks()
  auth.user = null
  useStore.getState().load(structuredClone(sample) as unknown as Snapshot)
})

test('the hub opens its pages; sign out shows only with a session', async () => {
  const { unmount } = await renderAt('/me')
  expect(screen.queryByText('Sign out')).toBeNull()
  fireEvent.click(screen.getByText('Privacy & preferences'))
  await settle()
  expect([path(), screenId()]).toEqual(['/me/privacy', 'ME-PRIV'])
  unmount()

  auth.user = { email: 'aoife@example.ie' }
  await renderAt('/me')
  fireEvent.click(screen.getByText('Sign out'))
  expect(auth.signOut).toHaveBeenCalled()
})

test('privacy: reminders are recorded both ways, export and delete are offered', async () => {
  await renderAt('/me/privacy')
  fireEvent.click(screen.getByText('Send me reminders and updates'))
  expect(plan().account.marketingConsent).toBe(true)
  expect(auth.postConsents).toHaveBeenCalledWith({ terms: true, marketing: true })
  expect(screen.getByText('Download my data').getAttribute('href')).toBe('/api/me/export')
  fireEvent.click(screen.getByText('Delete my data'))
  expect(useStore.getState().sheet).toBe('delete')
})

test('recheck confirms the first answers; only pages with a foot get one', async () => {
  const { container, unmount } = await renderAt('/me')
  expect(container.querySelector('.foot')).toBeNull()
  unmount()
  await renderAt('/me/recheck')
  fireEvent.click(screen.getByText('These still look right'))
  await settle()
  expect([path(), plan().moneyProfile.rechecked]).toEqual(['/me', true])
})

test('saving a profile section marks it done and fills an unanswered horizon', async () => {
  useStore.getState().update((p) => void (p.moneyProfile.section = 1))
  await renderAt('/me/profile/section')
  expect(screenId()).toBe('ME-UM1')
  fireEvent.click(screen.getByText('Save this section'))
  await settle()
  expect(plan().moneyProfile.done[1]).toBe(true)
  expect(plan().moneyProfile.answers.u9).toBeTypeOf('number')
  expect(path()).toBe('/me/profile')
})

test('an assumption typed as a percent is kept as a fraction, and Back restores the standard', () => {
  render(<AssumptionField name="wage" />)
  const box = document.querySelector('[data-nb="asm|wage"]') as HTMLInputElement
  fireEvent.input(box, { target: { value: '9' } })
  expect(plan().assumptions.wage).toBe(0.06) // capped at the 6% maximum
  expect(screen.getByText('Max 6%')).toBeTruthy()
  fireEvent.click(screen.getByText(/^Back to LifeMap's figure/))
  expect(plan().assumptions.wage).toBeUndefined()
  expect(valueInUse(plan(), 'wage')).toBeTypeOf('number')
})

test('assumption values read as words', () => {
  expect(formatAssumption('retireMult', 25)).toBe('25× (about 4% a year)')
  expect(formatAssumption('safetyMonths', 1)).toBe('1 month')
  expect(formatAssumption('spWeek', 299.3)).toBe('€299.30 a week')
  expect(formatAssumption('drawRule', 'min')).toBe('Minimum only (4% / 5%)')
  expect(formatAssumption('cashYears', null)).toBe('Not chosen yet')
})

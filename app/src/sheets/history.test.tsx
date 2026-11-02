// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import { useShell } from '../state/shell.ts'
import { useStore } from '../state/store.ts'
import { Body } from './history.sheet.tsx'

test('lists the saved versions and restores one into the plan, keeping the session flags', async () => {
  const restored = {
    ...useStore.getState().plan,
    versions: [],
    account: { ...useStore.getState().plan.account, name: 'Restored' },
  }
  const fetch = vi.fn(async (url: string, _init?: RequestInit) =>
    Response.json(
      url === '/api/plan/versions'
        ? { versions: [{ id: 7, note: 'Goals changed', at: '2026-09-29T10:00:00Z' }] }
        : { version: 4, plan: restored },
    ),
  )
  vi.stubGlobal('fetch', fetch)
  useShell.setState({ authed: true })
  useStore.getState().update((plan) => void (plan.account.emailVerified = true))

  render(<Body />)
  fireEvent.click(await screen.findByText('Restore'))

  await waitFor(() => expect(useStore.getState().plan.account.name).toBe('Restored'))
  expect(screen.getByText(/Goals changed/)).toBeTruthy()
  expect(screen.getByText(/29 Sep 2026/)).toBeTruthy()
  expect(fetch).toHaveBeenCalledWith(
    '/api/plan/versions/7/restore',
    expect.objectContaining({ body: '{"version":0}' }),
  )
  expect(useStore.getState().plan.account.emailVerified).toBe(true)
})

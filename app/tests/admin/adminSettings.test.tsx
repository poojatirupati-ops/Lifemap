// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, expect, test, vi } from 'vitest'
import Body from '../../src/components/admin/SettingsBody.tsx'
import { queryClient } from '../../src/auth/planSync.ts'
import { TENANT_KEY } from '../../src/shell/tenant.ts'

const { update } = vi.hoisted(() => ({ update: vi.fn(async () => ({ error: null })) }))
vi.mock('../../src/auth/client.ts', async (original) => ({
  ...(await original<object>()),
  authClient: { organization: { update } },
}))

const rates = () => queryClient.getQueryData<{ rates: Record<string, unknown> }>(TENANT_KEY)!.rates

/** Type into an input and leave it. */
function enter(input: HTMLElement, value: string) {
  fireEvent.input(input, { target: { value } })
  fireEvent.blur(input)
}

beforeEach(() => {
  update.mockClear()
  queryClient.setQueryData(TENANT_KEY, {
    id: 'org-a',
    slug: 'cu-a',
    name: '',
    logo: null,
    colors: {},
    features: {},
    rates: {},
  })
})

test('typed and picked partner figures are saved to the tenant; a list keeps the standard for blank items', async () => {
  render(<Body />)
  enter(screen.getByLabelText(/^Partner name/), ' Acme CU ')
  enter(screen.getByLabelText(/^Partner figure 3 for Risk and return: growth/), '8')
  fireEvent.change(screen.getByLabelText('Partner figure for How you draw your pension'), {
    target: { value: 'min' },
  })
  expect(rates()).toEqual({ riskMu: [0.02, 0.04, 0.08], drawRule: 'min' })
  expect(update).toHaveBeenLastCalledWith({
    organizationId: 'org-a',
    data: { metadata: { rates: { riskMu: [0.02, 0.04, 0.08], drawRule: 'min' } } },
  })
  expect(update).toHaveBeenCalledWith({ organizationId: 'org-a', data: { name: 'Acme CU' } })
  expect(await screen.findAllByText('Changed by Acme CU')).toHaveLength(2)

  fireEvent.click(screen.getByText('Back to the LifeMap standards'))
  await waitFor(() => expect(screen.queryByText('Changed by Acme CU')).toBeNull())
  expect(rates()).toEqual({})
})

test('refuses a figure outside the limits, says why, and keeps the standard', async () => {
  render(<Body />)
  const input = screen.getByLabelText(
    'Partner figure for Pay rises (a year) (%)',
  ) as HTMLInputElement
  enter(input, '9')
  expect(screen.getByRole('alert').textContent).toBe(
    'That figure is outside the allowed range, so it was not used. Allowed: 0% to 6%.',
  )
  expect(input.value).toBe('')
  expect(rates().wage).toBeUndefined()

  enter(screen.getByLabelText('Partner figure for Pay rises (a year) (%)'), '5')
  expect(screen.queryByRole('alert')).toBeNull()
  expect(await screen.findByText('Changed by your provider')).toBeTruthy()

  fireEvent.click(screen.getByText('Reset'))
  expect(rates().wage).toBeUndefined()
  await waitFor(() => expect(screen.queryByText('Back to the LifeMap standards')).toBeNull())
})

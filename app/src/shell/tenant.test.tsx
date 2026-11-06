// @vitest-environment jsdom
import { afterEach, expect, test, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { queryClient } from '../auth/planSync.ts'
import { applyTenantFigures, settingsInUse } from '../domain/planning/settings.ts'
import { usePlanFields } from '../hooks/usePlanFields.ts'
import {
  setPartnerFigure,
  TENANT_KEY,
  useBranding,
  useFeature,
  useTenantFigures,
} from './tenant.ts'

vi.mock('../auth/client.ts', () => ({
  authClient: {
    organization: { update: vi.fn(async () => ({ error: { message: 'forbidden' } })) },
  },
}))

afterEach(() => vi.unstubAllGlobals())

test('a tenant paints its colours over the CSS tokens and hides a flag that is off', async () => {
  const tenant = {
    id: 'org-cu',
    slug: 'cu',
    name: 'Credit Union',
    logo: null,
    colors: { coral: '#123456' },
    features: { ask: false },
  }
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => Response.json(tenant)),
  )
  const { result } = renderHook(() => {
    useBranding()
    return useFeature('ask')
  })
  await waitFor(() => expect(result.current).toBe(false))
  expect(document.documentElement.style.getPropertyValue('--coral')).toBe('#123456')
})

test("a failed save ends on the server's tenant, not the one from before the change", async () => {
  const tenant = {
    id: 'org-cu',
    slug: 'cu',
    name: 'Credit Union',
    logo: null,
    colors: {},
    features: {},
    rates: {},
  }
  // meanwhile another admin set inflation to 3%
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => Response.json({ ...tenant, rates: { infl: 0.03 } })),
  )
  queryClient.setQueryData(TENANT_KEY, tenant)
  renderHook(() => useTenantFigures())
  expect(await setPartnerFigure('infl', 0.05)).toBe('forbidden')
  await waitFor(() => expect(settingsInUse().standards.infl.partnerValue).toBe(0.03))
  expect(queryClient.getQueryData(TENANT_KEY)).toMatchObject({ rates: { infl: 0.03 } })
})

test('tenant figures redraw what reads the plan, without a remount', () => {
  const { result } = renderHook(() => usePlanFields('figures'))
  const before = result.current
  act(() => applyTenantFigures('Credit Union', { infl: 0.04 }))
  expect(result.current).not.toBe(before)
  expect(settingsInUse().standards.infl.partnerValue).toBe(0.04)
})

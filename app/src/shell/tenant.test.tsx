// @vitest-environment jsdom
import { afterEach, expect, test, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { queryClient } from '../auth/planSync.ts'
import { settingsInUse } from '../domain/planning/settings.ts'
import { setPartnerFigure, TENANT_KEY, useBranding, useFeature } from './tenant.ts'

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

test("a failed save shows the server's tenant again, not the one from before the change", async () => {
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
  const server = { ...tenant, rates: { infl: 0.03 } }
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => Response.json(server)),
  )
  queryClient.setQueryData(TENANT_KEY, tenant)
  expect(await setPartnerFigure('infl', 0.05)).toBe('forbidden')
  expect(queryClient.getQueryData(TENANT_KEY)).toMatchObject({ rates: { infl: 0.03 } })
  expect(settingsInUse().standards.infl.partnerValue).toBe(0.03)
})

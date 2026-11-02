// @vitest-environment jsdom
import { afterEach, expect, test, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useBranding, useFeature } from './tenant.ts'

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

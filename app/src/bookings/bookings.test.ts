import { afterEach, expect, test, vi } from 'vitest'
import { postBooking, SHARE_VERSION } from './bookings.ts'
import { fresh } from '../state/fresh.ts'

afterEach(() => vi.unstubAllGlobals())

test('a booking posts the adviser and exactly the ticked items', async () => {
  const fetch = vi.fn(async () => new Response('{"booking":{}}', { status: 201 }))
  vi.stubGlobal('fetch', fetch)
  const plan = fresh()
  plan.booking.share.fin = true
  await postBooking(plan, 'adviser-1')
  const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit]
  expect(url).toBe('/api/bookings')
  expect(JSON.parse(String(init.body))).toEqual({
    adviserId: 'adviser-1',
    share: { report: false, finances: true, docs: false, moneyProfile: false },
    shareVersion: SHARE_VERSION,
  })
})

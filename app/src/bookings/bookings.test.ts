import { afterEach, expect, test, vi } from 'vitest'
import { postBooking, SHARE_VERSION } from './bookings.ts'
import { fresh } from '../state/fresh.ts'

afterEach(() => vi.unstubAllGlobals())

test('a booking posts the adviser, slot and exactly the ticked items', async () => {
  const fetch = vi.fn(async () => new Response('{"booking":{}}', { status: 201 }))
  vi.stubGlobal('fetch', fetch)
  const plan = fresh()
  Object.assign(plan.booking, { slot: 'Wed 28 Oct · 10:00', mode: 'Video' })
  plan.booking.share.fin = true
  await postBooking(plan)
  const [url, init] = fetch.mock.calls[0] as unknown as [string, RequestInit]
  expect(url).toBe('/api/bookings')
  expect(JSON.parse(String(init.body))).toEqual({
    adviserId: 'Niamh Byrne',
    slot: 'Wed 28 Oct · 10:00',
    mode: 'Video',
    share: { report: false, finances: true, docs: false, moneyProfile: false },
    shareVersion: SHARE_VERSION,
  })
})

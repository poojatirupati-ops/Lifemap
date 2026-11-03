// @vitest-environment jsdom
// The booking journey: match, share with consent (a pending booking), then the adviser's Cal.com calendar;
// the meeting counts once the server (Cal.com's webhook) has confirmed it.
import { act } from 'react'
import { renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import sampleExp from '../fixtures/sample-exp.json'
import { queryClient } from '../../src/auth/planSync.ts'
import { ADVISERS, BOOKINGS, useBook, useBookings } from '../../src/bookings/bookings.ts'
import { useStore } from '../../src/state/store'
import { toOriginal } from '../../src/state/migrate'
import { seedContent } from '../content/seed'
import { path, renderAt, settle } from '../renderAt.tsx'

// Cal.com's embed: its props on a div, and its event API
const cal = vi.hoisted(() => ({ on: new Map<string, (e: unknown) => void>() }))
vi.mock('@calcom/embed-react', () => ({
  default: ({ calLink, config }: { calLink: string; config: Record<string, string> }) => (
    <div data-cal-link={calLink} data-config={JSON.stringify(config)} />
  ),
  getCalApi:
    async () => (command: string, args: { action: string; callback: (e: unknown) => void }) => {
      if (command === 'on') cal.on.set(args.action, args.callback)
    },
}))

// signed in as Jo
vi.mock('../../src/auth/client.ts', async (original) => {
  const module = await original<typeof import('../../src/auth/client.ts')>()
  const session = { data: { user: { name: 'Jo Byrne', email: 'jo@example.com' } } }
  return {
    ...module,
    authClient: new Proxy(module.authClient, {
      get: (client, key) => (key === 'useSession' ? () => session : Reflect.get(client, key)),
    }),
  }
})

seedContent()

const adviser = (id: string, name: string) => ({ id, name, calLink: `${id}/45min`, profile: null })
const pending = {
  id: 'b1',
  adviserId: 'ciaran',
  share: {},
  status: 'pending',
  calUid: null,
  startsAt: null,
}

describe('booking journey', () => {
  it('match, share with consent, pick a time on Cal.com, confirmed by the server', async () => {
    let bookings: unknown[] = []
    const fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input instanceof Request ? input.url : input)
      if (url.endsWith('/api/bookings') && init?.method === 'POST') {
        bookings = [pending]
        return Response.json({ booking: pending }, { status: 201 })
      }
      return Response.json({ bookings })
    })
    vi.stubGlobal('fetch', fetch)
    queryClient.setQueryData(ADVISERS, [
      adviser('niamh', 'Niamh Byrne'),
      adviser('ciaran', 'Ciarán Walsh'),
    ])
    useStore.getState().load(structuredClone(sampleExp))
    const { container } = await renderAt('/experts')
    const click = async (text: string) => {
      const button = [...container.querySelectorAll('button')].find((b) =>
        b.textContent?.includes(text),
      )
      if (!button) throw new Error(`no button "${text}"`)
      act(() => button.click())
      await settle()
    }
    const tick = (selector: string) =>
      act(() => (container.querySelector(selector) as HTMLInputElement).click())

    await click('Book my adviser meeting')
    // the profile is not finished, so the optional profile step comes first
    expect(path()).toBe('/experts/c0')
    await click('Skip for now')
    await click('See another match')
    await click('Choose Ciarán')
    expect((container.querySelector('#sharego') as HTMLButtonElement).disabled).toBe(true)
    tick('[data-share="report"]')
    tick('[data-agree]')
    await click('Pick a time')
    await vi.waitFor(() => expect(path()).toBe('/experts/c3'))
    const [, post] = fetch.mock.calls.find(([, init]) => init?.method === 'POST')!
    expect(JSON.parse(String(post!.body))).toMatchObject({
      adviserId: 'ciaran',
      share: { report: true, finances: false, docs: false, moneyProfile: false },
    })

    // the embed: the adviser's calendar, prefilled, carrying our booking id
    const embed = await vi.waitFor(() => {
      const div = container.querySelector('[data-cal-link="ciaran/45min"]')
      if (!div) throw new Error('no Cal.com embed yet')
      return div
    })
    expect(JSON.parse(embed.getAttribute('data-config')!)).toMatchObject({
      name: 'Jo Byrne',
      email: 'jo@example.com',
      'metadata[bookingId]': 'b1',
    })

    // Cal.com says booked; the app waits for the server (the webhook) to confirm it
    bookings = [{ ...pending, status: 'booked', calUid: 'cal-1', startsAt: '2026-10-28T10:00:00' }]
    act(() => cal.on.get('bookingSuccessfulV2')!({ detail: { data: { uid: 'cal-1' } } }))
    await vi.waitFor(() => expect(path()).toBe('/experts/c4'), { timeout: 5000 })
    vi.unstubAllGlobals()

    const { plan } = useStore.getState()
    expect(toOriginal(plan).book).toMatchObject({
      adv: 1,
      share: { report: true, fin: false, docs: false, um: false },
      agree: true,
      slot: 'Wed 28 Oct · 10:00',
      done: true,
    })
    expect(plan.versions.at(-1)?.note).toBe('Adviser meeting booked')
  })
})

/** GET /api/bookings answers `bookings`; POST answers the server's pending booking. */
function stubBookings(bookings: () => unknown[], posted = pending) {
  const fetch = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) =>
    init?.method === 'POST'
      ? Response.json({ booking: posted }, { status: 201 })
      : Response.json({ bookings: bookings() }),
  )
  vi.stubGlobal('fetch', fetch)
  return fetch
}

describe('booking with the server', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    queryClient.removeQueries({ queryKey: BOOKINGS })
  })

  it('a second trip to c3 reuses the open pending booking the server hands back', async () => {
    stubBookings(() => [pending])
    queryClient.setQueryData(BOOKINGS, [pending])
    const { result } = renderHook(() => useBook())
    await act(() => result.current.mutateAsync('ciaran'))
    expect(queryClient.getQueryData(BOOKINGS)).toEqual([pending])
  })

  it("c3 is the newest pending booking's adviser, not the match being shown", async () => {
    stubBookings(() => [pending])
    queryClient.setQueryData(ADVISERS, [
      adviser('niamh', 'Niamh Byrne'),
      adviser('ciaran', 'Ciarán Walsh'),
    ])
    useStore.getState().load(structuredClone(sampleExp))
    expect(useStore.getState().plan.booking.adviser).toBe(0) // the match shown is Niamh
    const { container } = await renderAt('/experts/c3')
    await vi.waitFor(() =>
      expect(container.querySelector('[data-cal-link="ciaran/45min"]')).not.toBeNull(),
    )
  })

  it('stops waiting for the webhook after 2 minutes and says the email will confirm it', async () => {
    const fetch = stubBookings(() => [pending])
    queryClient.setQueryData(ADVISERS, [adviser('ciaran', 'Ciarán Walsh')])
    useStore.getState().load(structuredClone(sampleExp))
    const { container } = await renderAt('/experts/c3')
    await vi.waitFor(() => expect(container.querySelector('[data-cal-link]')).not.toBeNull())
    vi.useFakeTimers()
    act(() => cal.on.get('bookingSuccessfulV2')!({ detail: { data: { uid: 'cal-1' } } }))
    await act(() => vi.advanceTimersByTimeAsync(2 * 60_000))
    expect(container.textContent).toContain("We're confirming your booking, we'll email you")
    const calls = fetch.mock.calls.length
    await act(() => vi.advanceTimersByTimeAsync(60_000))
    expect(fetch.mock.calls.length).toBe(calls)
  })

  it('a meeting that ended clears the share picks and agreement', async () => {
    useStore.getState().load(structuredClone(sampleExp))
    useStore.getState().update((plan) => {
      Object.assign(plan.booking, { done: true, agree: true })
      plan.booking.share.report = true
    })
    stubBookings(() => [{ ...pending, status: 'ended', calUid: 'cal-1' }])
    renderHook(() => useBookings())
    await vi.waitFor(() => expect(useStore.getState().plan.booking.done).toBe(false))
    expect(useStore.getState().plan.booking).toMatchObject({
      agree: false,
      share: { report: false, fin: false, docs: false, um: false },
    })
    expect(useStore.getState().plan.versions.at(-1)?.note).toBe('Adviser meeting ended')
  })

  it('a booking Cal.com has booked but not yet confirmed is not offered again', async () => {
    stubBookings(() => [{ ...pending, calUid: 'cal-1' }])
    queryClient.setQueryData(ADVISERS, [adviser('ciaran', 'Ciarán Walsh')])
    useStore.getState().load(structuredClone(sampleExp))
    const { container, unmount } = await renderAt('/experts/c3')
    await vi.waitFor(() => expect(container.textContent).toContain("We're confirming your booking"))
    expect(container.querySelector('[data-cal-link]')).toBeNull()
    unmount()

    const home = await renderAt('/experts')
    await vi.waitFor(() =>
      expect(home.container.textContent).toContain("We're confirming your booking"),
    )
    expect(home.container.textContent).not.toContain('Book my adviser meeting')
  })

  it('with only pending bookings, done goes false and the picks stay', async () => {
    useStore.getState().load(structuredClone(sampleExp))
    useStore.getState().update((plan) => {
      Object.assign(plan.booking, { done: true, agree: true })
      plan.booking.share.report = true
    })
    const versions = useStore.getState().plan.versions.length
    stubBookings(() => [pending])
    renderHook(() => useBookings())
    await vi.waitFor(() => expect(useStore.getState().plan.booking.done).toBe(false))
    expect(useStore.getState().plan.booking).toMatchObject({ agree: true, share: { report: true } })
    expect(useStore.getState().plan.versions.length).toBe(versions)
  })
})

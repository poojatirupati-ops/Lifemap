// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { onlineManager } from '@tanstack/react-query'
import { loadPlan, queryClient, savedFields, startPlanSync } from '../../src/auth/planSync.ts'
import { returnTo } from '../../src/shell/wall.ts'
import { fresh } from '../../src/state/fresh.ts'
import { useStore } from '../../src/state/store.ts'

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

let server: { version: number; plan: unknown }
let fetchMock: ReturnType<typeof vi.fn>
const puts = () => fetchMock.mock.calls.filter(([, init]) => init?.method === 'PUT')
const editNote = (whyNote: string) =>
  useStore.getState().update((plan) => void (plan.whyNote = whyNote))

beforeEach(async () => {
  vi.useFakeTimers()
  useStore.getState().load(fresh())
  queryClient.clear()
  onlineManager.setOnline(true)
  server = { version: 3, plan: null }
  fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
    if (init?.method !== 'PUT') return json(200, server)
    const body = JSON.parse(String(init.body))
    if (body.version !== server.version) return json(409, { version: server.version })
    server = { version: server.version + 1, plan: body.plan }
    return json(200, { version: server.version })
  })
  vi.stubGlobal('fetch', fetchMock)
  await loadPlan()
})
afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('plan sync', () => {
  it('saves only the persisted fields, never screen position or dev flags', () => {
    const plan = { ...fresh(), rt: 'XPL', admin: true, scr: 'B1', sheet: 'ask' }
    expect(Object.keys(savedFields(plan)).sort()).toMatchSnapshot()
    expect(savedFields(plan).acct).toEqual({
      name: '',
      email: '',
      mobile: '',
      c1: false,
      c2: false,
      pk: false,
    })
  })

  it('debounces changes into one save 1.5s after the last one', async () => {
    const stop = startPlanSync()
    editNote('a')
    await vi.advanceTimersByTimeAsync(1000)
    editNote('b')
    await vi.advanceTimersByTimeAsync(1499)
    expect(puts()).toHaveLength(0)
    await vi.advanceTimersByTimeAsync(1)
    expect(puts()).toHaveLength(1)
    expect(server).toMatchObject({ version: 4, plan: { whyNote: 'b' } })
    stop()
  })

  it('on 409 refetches the version and retries once', async () => {
    server.version = 9 // changed on another device
    const stop = startPlanSync()
    editNote('mine')
    await vi.advanceTimersByTimeAsync(1500)
    expect(puts()).toHaveLength(2)
    expect(server).toMatchObject({ version: 10, plan: { whyNote: 'mine' } })
    stop()
  })

  it('waits while offline and saves once back online', async () => {
    const stop = startPlanSync()
    onlineManager.setOnline(false)
    editNote('on the train')
    await vi.advanceTimersByTimeAsync(1500)
    expect(puts()).toHaveLength(0)
    onlineManager.setOnline(true)
    await vi.advanceTimersByTimeAsync(0)
    expect(server).toMatchObject({ plan: { whyNote: 'on the train' } })
    stop()
  })

  it('saves at once when the page is hidden', async () => {
    const stop = startPlanSync()
    editNote('leaving')
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(true)
    document.dispatchEvent(new Event('visibilitychange'))
    await vi.advanceTimersByTimeAsync(0)
    expect(puts()).toHaveLength(1)
    stop()
  })
})

describe('returnTo', () => {
  it('lands on the tab the wall caught, or the screen itself', () => {
    returnTo('XPL')
    expect(useStore.getState().plan).toMatchObject({ shell: true, tab: 'explore', rt: undefined })
    returnTo('B1')
    expect(useStore.getState().plan).toMatchObject({ tab: 'plan', pb: true })
    expect(useStore.getState().screen).toBe('B1')
    returnTo('F1')
    expect(useStore.getState().plan).toMatchObject({ shell: false, app: false })
    expect(useStore.getState().screen).toBe('F1')
  })
})

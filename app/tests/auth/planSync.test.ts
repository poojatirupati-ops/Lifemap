// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { onlineManager } from '@tanstack/react-query'
import { loadPlan, queryClient, savedFields, startPlanSync } from '../../src/auth/planSync.ts'
import { returnTo } from '../../src/shell/wall.ts'
import { fresh } from '../../src/state/fresh.ts'
import { useShell } from '../../src/state/shell.ts'
import { useStore } from '../../src/state/store.ts'
import samplePlan from '../../src/state/sample-plan.json'

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
  useShell.setState({ authed: true })
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
  it('loads a plan saved in the old shape under the readable names', async () => {
    server.plan = samplePlan // the prototype's short names, as plans were saved before the rename
    const { plan } = await loadPlan()
    expect(plan).toMatchObject({
      answers: { 2: 0 },
      account: { name: 'Aoife', termsAccepted: true, passkey: true },
      whatIf: { goalId: null, monthlyExtra: 0, lumpSum: 0 },
      assumptions: { planEnd: 95 },
    })
    expect(plan!.goals[0]).toMatchObject({ key: 'edu', emoji: '🎓', priority: 'Must have' })
    useStore.getState().load(plan!) // the screen state it carried goes to the store, not the plan
    expect(useStore.getState().plan).not.toHaveProperty('tab')
    expect(savedFields(plan!).account).not.toHaveProperty('emailVerified')
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
    expect(useStore.getState()).toMatchObject({
      inShell: true,
      tab: 'explore',
      returnTo: undefined,
    })
    returnTo('B1')
    expect(useStore.getState()).toMatchObject({ tab: 'plan', planBuilder: true })
    expect(useStore.getState().screen).toBe('B1')
    returnTo('F1')
    expect(useStore.getState()).toMatchObject({ inShell: false, plan: { hasResults: false } })
    expect(useStore.getState().screen).toBe('F1')
  })
})

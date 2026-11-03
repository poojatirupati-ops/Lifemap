// @vitest-environment jsdom
// The sign-in wall when the API cannot be reached: a browser that had a session carries on, anyone else signs in.
import { act } from 'react'
import { renderHook } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import { onlineManager } from '@tanstack/react-query'
import { queryClient } from '../../src/auth/planSync.ts'
import { enterApp, rememberSignedIn, wasSignedIn } from '../../src/auth/session.ts'
import { consentsQuery } from '../../src/auth/consents.ts'
import { useAnalyticsConsent } from '../../src/analytics/analytics.ts'
import { TENANT_KEY } from '../../src/shell/tenant.ts'
import { useWall } from '../../src/auth/useWall.ts'
import { fresh } from '../../src/state/fresh.ts'
import { useStore } from '../../src/state/store.ts'
import { useShell } from '../../src/state/shell.ts'
import { appRouter as router } from '../../src/shell/appRouter.ts'
import { path, renderAt } from '../renderAt.tsx'

const session = vi.hoisted(() => ({
  get: async (): Promise<unknown> => ({ data: null }),
  user: null as { id: string; name: string; email: string } | null,
}))
vi.mock('../../src/auth/client.ts', async (original) => {
  const module = await original<typeof import('../../src/auth/client.ts')>()
  return {
    ...module,
    authClient: new Proxy(module.authClient, {
      get: (client, key) =>
        key === 'getSession'
          ? session.get
          : key === 'useSession'
            ? () => ({ data: session.user && { user: session.user }, isPending: false })
            : Reflect.get(client, key),
    }),
  }
})

/** Signed out in this tab, then opens a page behind the wall. */
async function openWhileOffline(href: string) {
  await renderAt('/me')
  useShell.setState({ authed: false })
  await act(() => router.navigate({ href }))
}

afterEach(() => {
  session.user = null
  localStorage.clear()
  onlineManager.setOnline(true)
  vi.unstubAllGlobals()
})

test('offline after a session on this browser (even a reload): the page opens', async () => {
  session.get = () => Promise.reject(new TypeError('Failed to fetch'))
  rememberSignedIn(true)
  await openWhileOffline('/me/privacy')
  expect(path()).toBe('/me/privacy')
})

test('offline, never signed in here: sign in', async () => {
  session.get = () => Promise.reject(new TypeError('Failed to fetch'))
  await openWhileOffline('/me/privacy')
  expect(path()).toBe('/sign-in')
})

test('a 401 signs out and forgets the session', async () => {
  session.get = async () => ({ data: null, error: { status: 401 } })
  rememberSignedIn(true)
  await openWhileOffline('/me/privacy')
  expect(path()).toBe('/sign-in')
  expect(wasSignedIn()).toBe(false)
})

test('offline reload, then back online: the saved plan comes back and the empty one is never saved', async () => {
  const saved = { ...fresh(), whyNote: 'saved on the server' }
  const fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    if (init?.method === 'PUT') return Response.json({ version: 4 })
    if (url === '/api/plan') return Response.json({ version: 3, plan: saved })
    if (url === '/api/consents') return Response.json({ consents: {}, notice: '2026-10' })
    return Response.json({})
  })
  vi.stubGlobal('fetch', fetch)
  // the reload: through the wall on the remembered session, with an empty plan and no session yet
  session.get = () => Promise.reject(new TypeError('Failed to fetch'))
  rememberSignedIn(true)
  queryClient.clear()
  useStore.getState().load(fresh())
  await openWhileOffline('/me/privacy')
  const wall = renderHook(() => useWall())

  // back online: the session shows
  session.user = { id: 'u1', name: 'Aoife', email: 'aoife@example.ie' }
  wall.rerender()
  await vi.waitFor(() => expect(useStore.getState().plan.whyNote).toBe('saved on the server'))
  // its save goes out 1.5s after the restore
  await vi.waitFor(
    () => expect(fetch.mock.calls.some(([, init]) => init?.method === 'PUT')).toBe(true),
    { timeout: 3000 },
  )
  const sent = fetch.mock.calls
    .filter(([, init]) => init?.method === 'PUT')
    .map(([, init]) => JSON.parse(String(init!.body)).plan.whyNote)
  expect(sent).not.toContain(fresh().whyNote)
  wall.unmount()
  vi.unstubAllGlobals()
})

/** The API's answers; `plan` and `notice` as the server holds them. */
function stubApi(saved: unknown, notice: string | null) {
  const fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    if (init?.method === 'PUT') return Response.json({ version: 4 })
    if (url === '/api/plan') return Response.json({ version: 3, plan: saved })
    if (url === '/api/consents') return Response.json({ consents: {}, notice })
    return Response.json({})
  })
  vi.stubGlobal('fetch', fetch)
  return fetch
}

/** Through the wall offline on the remembered session, then the session shows while still offline. */
async function enterOffline(email: string) {
  session.get = () => Promise.reject(new TypeError('Failed to fetch'))
  rememberSignedIn(true)
  queryClient.clear()
  useStore.getState().load(fresh())
  await openWhileOffline('/me/privacy')
  onlineManager.setOnline(false)
  session.user = { id: email, name: 'Aoife', email }
  return renderHook(() => useWall())
}

const wait = (ms: number) => act(() => new Promise((done) => setTimeout(done, ms)))

test('offline, saving waits for the saved plan; back online it comes back and only it is saved', async () => {
  const fetch = stubApi({ ...fresh(), whyNote: 'saved on the server' }, '2026-10')
  const wall = await enterOffline('aoife2@example.ie')
  act(() => useStore.getState().update((plan) => void (plan.whyNote = 'edited offline')))
  await wait(2000)
  expect(fetch.mock.calls.some(([, init]) => init?.method === 'PUT')).toBe(false)

  act(() => onlineManager.setOnline(true))
  await vi.waitFor(() => expect(useStore.getState().plan.whyNote).toBe('saved on the server'))
  await vi.waitFor(
    () => expect(fetch.mock.calls.some(([, init]) => init?.method === 'PUT')).toBe(true),
    { timeout: 3000 },
  )
  const sent = fetch.mock.calls
    .filter(([, init]) => init?.method === 'PUT')
    .map(([, init]) => JSON.parse(String(init!.body)).plan.whyNote)
  expect(sent).not.toContain('edited offline')
  wall.unmount()
}, 10000)

test('offline, the user lands; only a real "not agreed" asks for details, once back online', async () => {
  stubApi(null, null)
  const wall = await enterOffline('aoife3@example.ie')
  await wait(50)
  expect(path()).not.toBe('/account/details')
  expect(useShell.getState().authed).toBe(true)

  act(() => onlineManager.setOnline(true))
  await vi.waitFor(() => expect(path()).toBe('/account/details'))
  wall.unmount()
})

test('a session that ended elsewhere: the next code sign-in as the same account enters and lands again', async () => {
  stubApi(null, '2026-10')
  await renderAt('/me')
  session.user = { id: 'u5', name: 'Aoife', email: 'aoife5@example.ie' }
  await act(() => enterApp({ name: '', email: 'aoife5@example.ie' }))
  // signed out in another tab: the session hook settles with no user
  session.user = null
  const wall = renderHook(() => useWall())
  await act(() => router.navigate({ href: '/me/privacy' }))
  await act(() => enterApp({ name: '', email: 'aoife5@example.ie' }))
  expect(path()).not.toBe('/me/privacy')
  wall.unmount()
})

test('an online consents check that fails still lands, then asks again until the API answers', async () => {
  const fetch = stubApi(null, null)
  const answer = fetch.getMockImplementation()!
  let down = true // the first ask fails
  fetch.mockImplementation(async (input, init) => {
    if (String(input) !== '/api/consents' || !down) return answer(input, init)
    down = false
    return Response.json({}, { status: 503 })
  })
  await renderAt('/me/privacy')
  await act(() => enterApp({ name: '', email: 'aoife6@example.ie' }))
  expect(path()).not.toBe('/account/details') // landed without the answer
  await vi.waitFor(() => expect(path()).toBe('/account/details'), { timeout: 5000 })
}, 10000)

test("A then B on one browser: B's analytics never runs on A's consent", async () => {
  stubApi(null, '2026-10') // B has not granted analytics
  queryClient.setQueryData(TENANT_KEY, { features: { analytics: true }, rates: {} })
  queryClient.setQueryData(consentsQuery('a@example.ie').queryKey, {
    consents: { analytics: { granted: true, version: '2026-11' } },
    notice: '2026-10',
  })
  await renderAt('/me')
  session.user = { id: 'b', name: 'B', email: 'b@example.ie' }
  await act(() => enterApp({ name: '', email: 'b@example.ie' }))
  const seen: (boolean | null)[] = []
  const { result } = renderHook(() => {
    const granted = useAnalyticsConsent()
    seen.push(granted)
    return granted
  })
  await vi.waitFor(() => expect(result.current).toBe(false))
  expect(seen).not.toContain(true)
  expect(queryClient.getQueryData(consentsQuery('a@example.ie').queryKey)).toBeUndefined()
})

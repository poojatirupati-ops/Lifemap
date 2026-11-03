// @vitest-environment jsdom
// The sign-in wall when the API cannot be reached: a browser that had a session carries on, anyone else signs in.
import { act } from 'react'
import { renderHook } from '@testing-library/react'
import { afterEach, expect, test, vi } from 'vitest'
import { queryClient } from '../../src/auth/planSync.ts'
import { rememberSignedIn, wasSignedIn } from '../../src/auth/session.ts'
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

afterEach(() => localStorage.clear())

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

test('a restore that fails offline pauses saving until it succeeds once back online', async () => {
  const saved = { ...fresh(), whyNote: 'saved on the server' }
  let reachable = false
  const fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    if (!reachable && url === '/api/plan') throw new TypeError('Failed to fetch')
    if (init?.method === 'PUT') return Response.json({ version: 4 })
    if (url === '/api/plan') return Response.json({ version: 3, plan: saved })
    if (url === '/api/consents') return Response.json({ consents: {}, notice: '2026-10' })
    return Response.json({})
  })
  vi.stubGlobal('fetch', fetch)
  session.get = () => Promise.reject(new TypeError('Failed to fetch'))
  rememberSignedIn(true)
  queryClient.clear()
  useStore.getState().load(fresh())
  await openWhileOffline('/me/privacy')
  session.user = { id: 'u2', name: 'Aoife', email: 'aoife2@example.ie' }
  const wall = renderHook(() => useWall())
  await vi.waitFor(() =>
    expect(fetch.mock.calls.some(([url]) => String(url) === '/api/plan')).toBe(true),
  )

  // edited while the saved plan could not be read: nothing is saved
  act(() => useStore.getState().update((plan) => void (plan.whyNote = 'edited offline')))
  await new Promise((done) => setTimeout(done, 2000))
  expect(fetch.mock.calls.some(([, init]) => init?.method === 'PUT')).toBe(false)

  // back online: the saved plan comes back, and only it is saved
  reachable = true
  act(() => void window.dispatchEvent(new Event('online')))
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
  vi.unstubAllGlobals()
}, 10000)

test('a consents check that fails offline keeps the user where they are; only a real "not agreed" asks for details', async () => {
  let reachable = false
  const fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    if (!reachable && url === '/api/consents') throw new TypeError('Failed to fetch')
    if (init?.method === 'PUT') return Response.json({ version: 4 })
    if (url === '/api/plan') return Response.json({ version: 3, plan: null })
    if (url === '/api/consents') return Response.json({ consents: {}, notice: null })
    return Response.json({})
  })
  vi.stubGlobal('fetch', fetch)
  session.get = () => Promise.reject(new TypeError('Failed to fetch'))
  rememberSignedIn(true)
  queryClient.clear()
  await openWhileOffline('/me/privacy')
  session.user = { id: 'u3', name: 'Aoife', email: 'aoife3@example.ie' }
  const wall = renderHook(() => useWall())
  await vi.waitFor(() =>
    expect(fetch.mock.calls.some(([url]) => String(url) === '/api/consents')).toBe(true),
  )
  await new Promise((done) => setTimeout(done, 50))
  expect(path()).toBe('/me/privacy')

  // back online, the server says this account has not agreed yet
  reachable = true
  act(() => void window.dispatchEvent(new Event('online')))
  await vi.waitFor(() => expect(path()).toBe('/account/details'))
  wall.unmount()
  vi.unstubAllGlobals()
})

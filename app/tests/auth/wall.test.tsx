// @vitest-environment jsdom
// The sign-in wall when the API cannot be reached: a user whose plan is loaded carries on, anyone else signs in.
import { act } from 'react'
import { afterEach, expect, test, vi } from 'vitest'
import { PLAN_KEY, queryClient } from '../../src/auth/planSync.ts'
import { useShell } from '../../src/state/shell.ts'
import { appRouter as router } from '../../src/shell/appRouter.ts'
import { path, renderAt } from '../renderAt.tsx'

const session = vi.hoisted(() => ({ get: async (): Promise<unknown> => ({ data: null }) }))
vi.mock('../../src/auth/client.ts', async (original) => {
  const module = await original<typeof import('../../src/auth/client.ts')>()
  return {
    ...module,
    authClient: new Proxy(module.authClient, {
      get: (client, key) => (key === 'getSession' ? session.get : Reflect.get(client, key)),
    }),
  }
})

/** Signed out in this tab, then opens a page behind the wall. */
async function openWhileOffline(href: string) {
  await renderAt('/me')
  useShell.setState({ authed: false })
  await act(() => router.navigate({ href }))
}

afterEach(() => queryClient.removeQueries({ queryKey: PLAN_KEY }))

test('offline with the plan loaded: the page opens', async () => {
  session.get = () => Promise.reject(new TypeError('Failed to fetch'))
  queryClient.setQueryData(PLAN_KEY, { version: 1, plan: null })
  await openWhileOffline('/me/privacy')
  expect(path()).toBe('/me/privacy')
})

test('offline without a plan: sign in', async () => {
  session.get = () => Promise.reject(new TypeError('Failed to fetch'))
  await openWhileOffline('/me/privacy')
  expect(path()).toBe('/sign-in')
})

test('a 401 signs out even with the plan loaded', async () => {
  session.get = async () => ({ data: null, error: { status: 401 } })
  queryClient.setQueryData(PLAN_KEY, { version: 1, plan: null })
  await openWhileOffline('/me/privacy')
  expect(path()).toBe('/sign-in')
})

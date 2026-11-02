// @vitest-environment jsdom
import { afterEach, expect, test, vi } from 'vitest'
import { authClient } from './client.ts'
import { enterApp } from './session.ts'
import { useStore } from '../state/store.ts'
import { fresh } from '../state/fresh.ts'
import { startFrom, useShell } from '../state/shell.ts'
import { router } from '../shell/router.ts'

vi.mock('./client.ts', () => ({
  authClient: {
    organization: {
      acceptInvitation: vi.fn(async () => ({
        data: { invitation: { organizationId: 'org-a' } },
        error: null,
      })),
      setActive: vi.fn(async () => ({ data: {}, error: null })),
    },
  },
}))

/** GET /api/consents and /api/plan answers for this test. */
const stubApi = (notice: string | null, plan: unknown = null) =>
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) =>
      Response.json(url === '/api/consents' ? { consents: {}, notice } : { version: 1, plan }),
    ),
  )

const user = { name: '', email: 'a@b.ie' }

afterEach(() => {
  vi.unstubAllGlobals()
  startFrom(fresh())
})

test('invite link: kept through sign-in, accepted, made active, then a new account gives its details', async () => {
  useShell.setState({ authed: true })
  await router.navigate({ href: '/?invitation=inv-1' })
  stubApi(null)
  await enterApp(user)
  expect(authClient.organization.acceptInvitation).toHaveBeenCalledWith({ invitationId: 'inv-1' })
  expect(authClient.organization.setActive).toHaveBeenCalledWith({ organizationId: 'org-a' })
  expect(location.search).toBe('')
  expect(router.state.location.pathname).toBe('/account/details')
})

test('returning user with an unfinished onboarding resumes at the next open question', async () => {
  const saved = { ...fresh(), answers: { 2: 0, 4: 1 }, why: ['track'] }
  stubApi('2026-10', saved)
  await enterApp(user)
  expect(router.state.location.pathname).toBe('/discover/3')
  expect(useStore.getState().plan.discoverStep).toBe(2)
})

// @vitest-environment jsdom
import { afterEach, expect, test, vi } from 'vitest'
import { onlineManager } from '@tanstack/react-query'
import { PLAN_KEY, queryClient } from './planSync.ts'
import { authClient } from './client.ts'
import { enterApp, signOut } from './session.ts'
import { JOURNEY_PAGES } from '../state/journeyPage.ts'
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
    signOut: vi.fn(async () => ({ data: {}, error: null })),
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
  await enterApp({ name: '', email: 'b@c.ie' })
  // landed at once, then again where the restored plan resumes
  await vi.waitFor(() => expect(router.state.location.pathname).toBe('/discover/3'))
  await vi.waitFor(() => expect(useStore.getState().plan.discoverStep).toBe(2))
})

test("sign-out forgets the topic pages' picks, watched videos and seats", async () => {
  JOURNEY_PAGES.Mortgages.setState({
    situation: 2,
    video: 1,
    watched: { '2-1': true },
    seats: { '2-0': true },
  })
  await signOut()
  expect(JOURNEY_PAGES.Mortgages.getState()).toMatchObject({
    situation: 0,
    video: 0,
    watched: {},
    seats: {},
  })
})

test('an account is entered once: the session showing after an in-app sign-in does not enter it again', async () => {
  stubApi('2026-10')
  await enterApp({ name: '', email: 'Niamh@Example.ie' })
  await enterApp({ name: '', email: 'niamh@example.ie' })
  const consents = vi.mocked(fetch).mock.calls.filter(([url]) => url === '/api/consents')
  expect(consents).toHaveLength(1)
})

test("another account entering drops the last one's plan version, so nothing saves until its own is read", async () => {
  stubApi('2026-10', { ...fresh(), whyNote: 'theirs' })
  queryClient.setQueryData(PLAN_KEY, { version: 9, plan: null }) // the account signed in before
  onlineManager.setOnline(false)
  const entering = enterApp({ name: '', email: 'ciara@example.ie' })
  expect(queryClient.getQueryData(PLAN_KEY)).toBeUndefined()
  queryClient.mount() // plan sync's client: resumes paused reads
  onlineManager.setOnline(true)
  await entering
  await vi.waitFor(() => expect(useStore.getState().plan.whyNote).toBe('theirs'))
  expect(queryClient.getQueryData(PLAN_KEY)).toMatchObject({ version: 1 })
  queryClient.unmount()
})

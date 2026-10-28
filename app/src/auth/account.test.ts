// @vitest-environment jsdom
import { afterEach, expect, test, vi } from 'vitest'
import { MARKETING_VERSION, NOTICE_VERSION, postConsents, startPlanSync, stopPlanSync } from './planSync.ts'
import { deleteAccount } from './useWall.ts'
import { useShell } from '../state/shell.ts'
import { useStore } from '../state/store.ts'

const calls = (fetch: ReturnType<typeof vi.fn>) =>
  fetch.mock.calls.map(([url, init]) => `${(init as RequestInit | undefined)?.method ?? 'GET'} ${url}`)

const stubFetch = (status: number, body: unknown = {}) => {
  const fetch = vi.fn(async (_url: string, _init?: RequestInit) => new Response(JSON.stringify(body), { status }))
  vi.stubGlobal('fetch', fetch)
  return fetch
}

afterEach(() => {
  stopPlanSync()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

test('delete: server error keeps everything, resumes sync, says nothing was deleted', async () => {
  useStore.getState().update((plan) => void (plan.acct.name = 'Aoife'))
  startPlanSync()
  stubFetch(500)
  await deleteAccount()
  expect(useStore.getState().plan.acct.name).toBe('Aoife')
  expect(useShell.getState().toastMessage).toMatch(/couldn't delete.*Nothing was deleted/)
  expect(stopPlanSync()).toBe(true) // sync was restarted
})

test('delete: stale session asks to sign in again, keeps data', async () => {
  stubFetch(400, { code: 'SESSION_EXPIRED' })
  await deleteAccount()
  expect(useShell.getState().toastMessage).toMatch(/sign in again/)
})

test('delete: 2xx resets this browser, says deleted, and the blank plan is never saved back', async () => {
  vi.useFakeTimers()
  useStore.getState().update((plan) => void (plan.acct.name = 'Aoife'))
  startPlanSync()
  const fetch = stubFetch(200, { success: true })
  await deleteAccount()
  expect(useStore.getState().plan.acct.name).toBe('')
  expect(useShell.getState().toastMessage).toBe('Your account and all your data were deleted')
  useStore.getState().update((plan) => void (plan.acct.name = 'x'))
  await vi.advanceTimersByTimeAsync(5000)
  expect(calls(fetch).filter((c) => c.startsWith('PUT'))).toEqual([])
  expect(calls(fetch)[0]).toBe('DELETE /api/me')
})

test('consents: notice acknowledgement + marketing event with versions; withdrawal sent; failure retried then told', async () => {
  vi.useFakeTimers()
  const ok = stubFetch(200)
  await postConsents({ terms: true, marketing: false })
  expect(JSON.parse(String(ok.mock.calls[0]?.[1]?.body))).toEqual({
    notice: NOTICE_VERSION,
    marketing: { granted: false, version: MARKETING_VERSION },
  })

  const down = stubFetch(503)
  const saved = postConsents({ terms: true, marketing: true })
  await vi.advanceTimersByTimeAsync(5000)
  expect(await saved).toBe(false)
  expect(down).toHaveBeenCalledTimes(3)
  expect(useShell.getState().toastMessage).toMatch(/couldn't be saved/)
})

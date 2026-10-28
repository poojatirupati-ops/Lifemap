// @vitest-environment jsdom
import { renderHook, waitFor } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import { createAuthClient } from './authClient.ts'

const user = { id: 'u1', email: 'a@b.ie' }
function fake(signedIn: boolean) {
  let live = signedIn
  const fetchFn = (async (url: string) => {
    const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status })
    if (url.endsWith('/get-session')) return live ? json({ user }) : json(null)
    if (url.endsWith('/sign-out')) return json({})
    if (url.endsWith('/sign-in/email-otp')) { live = true; return json({}) }
    return live ? json({ ok: 1 }) : json({}, 401)
  }) as unknown as typeof fetch
  return { c: createAuthClient(fetchFn), expire: () => (live = false) }
}

test('signed-out, signed-in, 401 expires, sign-out clears', async () => {
  const out = fake(false)
  await out.c.getSession()
  expect(out.c.getState()).toEqual({ status: 'signed-out', user: null })

  const { c, expire } = fake(true)
  expect(c.getState().status).toBe('loading')
  await c.getSession()
  expect(c.getState()).toEqual({ status: 'signed-in', user })
  expire()
  await c.apiFetch('/api/plan')
  expect(c.getState().status).toBe('expired')
  await c.signOut()
  expect(c.getState()).toEqual({ status: 'signed-out', user: null })

  expect(await out.c.signIn('a@b.ie', '123456')).toBe(true)
  expect(out.c.getState().status).toBe('signed-in')
})

test('signed-in session that comes back null on revalidation is expired', async () => {
  const { c, expire } = fake(true)
  await c.getSession()
  expire()
  await c.getSession()
  expect(c.getState().status).toBe('expired')
})

test('transient 503 or thrown fetch while signed-in keeps the session', async () => {
  let mode: 'ok' | '503' | 'throw' = 'ok'
  const c = createAuthClient((async () => {
    if (mode === 'throw') throw new TypeError('offline')
    return mode === '503' ? new Response('', { status: 503 }) : new Response(JSON.stringify({ user }))
  }) as unknown as typeof fetch)
  await c.getSession()
  mode = '503'; await c.getSession()
  expect(c.getState()).toEqual({ status: 'signed-in', user })
  mode = 'throw'; await c.getSession()
  expect(c.getState()).toEqual({ status: 'signed-in', user })
})

test('network errors: sendCode/signIn return false, getSession locks', async () => {
  const c = createAuthClient((async () => { throw new TypeError('offline') }) as unknown as typeof fetch)
  expect(await c.sendCode('a@b.ie')).toBe(false)
  expect(await c.signIn('a@b.ie', '1')).toBe(false)
  await c.getSession()
  expect(c.getState().status).toBe('signed-out')
  const ok = fake(true)
  expect(await ok.c.sendCode('a@b.ie')).toBe(true)
})

test('passkey: verify body shape, cancel and bad options return false', async () => {
  const bytes = (...n: number[]) => new Uint8Array(n).buffer
  const cred = {
    id: 'cid', rawId: bytes(251, 255), type: 'public-key', getClientExtensionResults: () => ({}),
    response: { authenticatorData: bytes(1), clientDataJSON: bytes(2), signature: bytes(3), userHandle: null },
  }
  const get = vi.fn().mockResolvedValue(cred)
  vi.stubGlobal('navigator', { credentials: { get } })
  const bodies: unknown[] = []
  let live = false
  const fetchFn = (async (url: string, init?: RequestInit) => {
    const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status })
    if (url.endsWith('/generate-authenticate-options')) return json({ challenge: 'AQI_' })
    if (url.endsWith('/verify-authentication')) { bodies.push(JSON.parse(init?.body as string)); live = true; return json({}) }
    return live ? json({ user }) : json(null)
  }) as unknown as typeof fetch
  const c = createAuthClient(fetchFn)
  expect(await c.signInWithPasskey()).toBe(true)
  expect(bodies[0]).toEqual({ response: { id: 'cid', rawId: '-_8', type: 'public-key', clientExtensionResults: {},
    response: { authenticatorData: 'AQ', clientDataJSON: 'Ag', signature: 'Aw' } } })
  expect([...(get.mock.calls[0][0].publicKey.challenge as Uint8Array)]).toEqual([1, 2, 63])

  get.mockRejectedValue(new DOMException('cancelled', 'NotAllowedError'))
  expect(await createAuthClient(fetchFn).signInWithPasskey()).toBe(false)
  const bad = createAuthClient((async () => new Response('<html>', { status: 500 })) as unknown as typeof fetch)
  expect(await bad.signInWithPasskey()).toBe(false)
  const rejected = createAuthClient((async (url: string) =>
    url.endsWith('/generate-authenticate-options') ? new Response(JSON.stringify({ challenge: 'AQI_' })) : new Response('{}', { status: 400 })) as unknown as typeof fetch)
  get.mockResolvedValue(cred)
  expect(await rejected.signInWithPasskey()).toBe(false)
  vi.unstubAllGlobals()
})

test('useSession: loading then signed-in', async () => {
  vi.stubGlobal('fetch', (async () => new Response(JSON.stringify({ user }))) as unknown as typeof fetch)
  const { useSession } = await import('./useSession.ts')
  const { result } = renderHook(() => useSession())
  expect(result.current.status).toBe('loading')
  await waitFor(() => expect(result.current.status).toBe('signed-in'))
  expect(result.current.user).toEqual(user)
  vi.unstubAllGlobals()
})

import { beforeEach, expect, test, vi } from 'vitest'
import { createSync, SYNC_KEY } from './sync.ts'
import { KEY } from './store.ts'
import { defaultPlan, type Plan } from './types.ts'

const mem = new Map<string, string>()
globalThis.localStorage = {
  getItem: k => mem.get(k) ?? null, setItem: (k, v) => void mem.set(k, v), removeItem: k => void mem.delete(k),
} as Storage
beforeEach(() => { mem.clear(); vi.useFakeTimers() })

function rig(server: { version: number; plan: Plan | null }, status = 'signed-in') {
  let plan = defaultPlan()
  const calls: string[] = []
  const ls = new Set<() => void>()
  const a = { status, stale: 0, offline: false, getFails: 0, uid: 'u1', gate: null as Promise<void> | null }
  const auth = {
    getState: () => ({ status: a.status, user: { id: a.uid } }),
    subscribe: (l: () => void) => (ls.add(l), () => void ls.delete(l)),
    apiFetch: async (_p: string, init?: RequestInit) => {
      if (a.offline) throw new TypeError('offline')
      const j = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s })
      if (!init?.method) { calls.push('GET'); if (a.gate) await a.gate; if (a.getFails > 0) { a.getFails--; return j({}, 503) } return j(server) }
      const body = JSON.parse(init.body as string) as { version: number; plan: Plan }
      calls.push(`PUT v${body.version}`)
      if (a.stale > 0) { a.stale--; server.version += 1; return j({ error: 'stale' }, 409) }
      if (body.version !== server.version) return j({ error: 'stale' }, 409)
      server = { version: body.version + 1, plan: body.plan }
      return j({ version: server.version })
    },
  }
  const sets: (() => void)[] = []   // shell effects not yet run
  const s = createSync({ auth, getPlan: () => plan, setPlan: p => { plan = { ...plan, ...p }; sets.push(() => s.changed()) }, wait: 100 })
  const set = (st: string) => { a.status = st; ls.forEach(l => l()) }
  return { s, a, sets, calls, set, srv: () => server, plan: () => plan, edit: (p: Partial<Plan>) => { plan = { ...plan, ...p }; s.changed() } }
}
const settle = async (r: ReturnType<typeof rig>) => { await vi.advanceTimersByTimeAsync(200); await r.s.idle() }

test('first login carries local answers up, never re-asked', async () => {
  const r = rig({ version: 0, plan: null })
  r.edit({ why: ['home'] }); r.calls.length = 0
  r.s.start(); await r.s.idle()
  expect(r.calls).toEqual(['GET', 'PUT v0'])
  expect(r.srv().plan?.why).toEqual(['home'])
})

test('server plan is adopted without a baseline, even when local is dirty; kept when this device synced before', async () => {
  const sp = { ...defaultPlan(), why: ['server'] }
  const a = rig({ version: 3, plan: sp }); a.s.start(); await a.s.idle()
  expect(a.plan().why).toEqual(['server'])
  mem.clear()
  const c = rig({ version: 3, plan: sp }); c.edit({ why: ['answers'] }); c.s.start(); await c.s.idle()
  expect(c.plan().why).toEqual(['server']); expect(c.srv().version).toBe(3)
  mem.set(SYNC_KEY, JSON.stringify({ version: 3, dirty: true, uid: 'u1' }))
  const b = rig({ version: 3, plan: sp }); b.edit({ why: ['local'] }); b.s.start(); await b.s.idle()
  expect(b.srv().plan?.why).toEqual(['local']); expect(b.srv().version).toBe(4)
})

test('failed first GET: no push until reconcile succeeds, server plan survives', async () => {
  const sp = { ...defaultPlan(), why: ['server'] }
  const r = rig({ version: 5, plan: sp }); r.a.getFails = 1
  r.edit({ whyNote: 'x' }); r.s.start(); await r.s.idle()
  expect(r.calls).toEqual(['GET'])
  r.edit({ whyNote: 'xy' }); await settle(r)
  expect(r.calls).toEqual(['GET', 'GET']); expect(r.plan().why).toEqual(['server']); expect(r.srv().plan?.why).toEqual(['server'])
})

test('a different account on this device never gets the previous plan', async () => {
  mem.set(SYNC_KEY, JSON.stringify({ version: 7, dirty: true, uid: 'alice' }))
  const r = rig({ version: 2, plan: { ...defaultPlan(), why: ['bob'] } })
  r.edit({ why: ['alice'] }); r.s.start(); await r.s.idle()
  expect(r.calls).toEqual(['GET']); expect(r.plan().why).toEqual(['bob']); expect(r.srv().version).toBe(2)
  mem.set(SYNC_KEY, JSON.stringify({ version: 7, dirty: true, uid: 'alice' }))
  const e = rig({ version: 0, plan: null })
  e.edit({ why: ['alice'] }); e.s.start(); await e.s.idle()
  expect(e.srv().plan?.why).toEqual([])
})

test('carry-over clears fromPublic locally too', async () => {
  const r = rig({ version: 0, plan: null }); r.edit({ fromPublic: true }); r.s.start(); await r.s.idle()
  expect(r.plan().fromPublic).toBe(false)
})

test('409 retries are capped at 3', async () => {
  const r = rig({ version: 0, plan: null }); r.s.start(); await r.s.idle(); r.calls.length = 0
  r.a.stale = 9; r.edit({ whyNote: 'x' }); await settle(r)
  expect(r.calls.filter(c => c.startsWith('PUT'))).toHaveLength(3)
})

test('expired then signed in again runs reconcile again', async () => {
  const r = rig({ version: 0, plan: null }); r.s.start(); await r.s.idle(); r.calls.length = 0
  r.set('expired'); r.edit({ whyNote: 'p' }); r.set('signed-in'); await r.s.idle()
  expect(r.calls).toEqual(['GET', 'PUT v1']); expect(r.srv().plan?.whyNote).toBe('p')
})

test('debounce: many edits, one PUT', async () => {
  const r = rig({ version: 0, plan: null }); r.s.start(); await r.s.idle(); r.calls.length = 0
  r.edit({ whyNote: 'a' }); r.edit({ whyNote: 'ab' }); r.edit({ whyNote: 'abc' })
  await settle(r)
  expect(r.calls).toEqual(['PUT v1']); expect(r.srv().plan?.whyNote).toBe('abc')
})

test('409 refetches the version and retries', async () => {
  const r = rig({ version: 0, plan: null }); r.s.start(); await r.s.idle(); r.calls.length = 0
  r.a.stale = 1; r.edit({ whyNote: 'x' }); await settle(r)
  expect(r.calls).toEqual(['PUT v1', 'GET', 'PUT v2']); expect(r.srv().plan?.whyNote).toBe('x')
})

test('offline is a no-op and stays dirty; expired pauses', async () => {
  const r = rig({ version: 0, plan: null }); r.s.start(); await r.s.idle(); r.calls.length = 0
  r.a.offline = true; r.edit({ whyNote: 'o' }); await settle(r)
  expect(r.plan().whyNote).toBe('o'); expect(JSON.parse(mem.get(SYNC_KEY)!).dirty).toBe(true)
  r.a.offline = false; r.set('expired'); r.edit({ whyNote: 'p' }); await settle(r)
  expect(r.calls).toEqual([])
})

test('sign-out wipes the local plan and sync state', async () => {
  const r = rig({ version: 0, plan: null }); r.s.start(); await r.s.idle()
  r.edit({ whyNote: 'secret' }); mem.set(KEY, 'plan')
  r.set('signed-out')
  expect(r.plan().whyNote).toBe(''); expect(mem.has(KEY)).toBe(false); expect(mem.has(SYNC_KEY)).toBe(false)
})

test('sign-out during an in-flight reconcile: the old plan is not restored and the next account reconciles', async () => {
  const r = rig({ version: 4, plan: { ...defaultPlan(), why: ['old'] } })
  let open!: () => void; r.a.gate = new Promise(res => { open = res })
  r.s.start(); await vi.advanceTimersByTimeAsync(0); r.set('signed-out'); open(); await r.s.idle()
  expect(r.plan().why).toEqual([]); expect(mem.has(SYNC_KEY)).toBe(false)
  r.a.gate = null; r.a.uid = 'u2'; r.set('signed-in'); await r.s.idle()
  expect(r.calls).toEqual(['GET', 'GET']); expect(r.plan().why).toEqual(['old'])  // u2 fetched its own (fake) server plan
})

test('plan applied by sync is not an edit: deferred changed() after adopt and sign-out does not PUT or recreate meta', async () => {
  const r = rig({ version: 3, plan: { ...defaultPlan(), why: ['server'] } }); r.s.start(); await r.s.idle()
  r.sets.forEach(f => f()); await settle(r)
  expect(r.calls).toEqual(['GET']); expect(JSON.parse(mem.get(SYNC_KEY)!).dirty).toBe(false)
  r.sets.length = 0; r.set('signed-out'); r.sets.forEach(f => f()); await settle(r)
  expect(mem.has(SYNC_KEY)).toBe(false)
})

test('last write wins: a dirty baseline device overwrites a newer server plan', async () => {
  mem.set(SYNC_KEY, JSON.stringify({ version: 3, dirty: true, uid: 'u1' }))
  const r = rig({ version: 5, plan: { ...defaultPlan(), why: ['other device'] } }); r.edit({ why: ['mine'] }); r.s.start(); await r.s.idle()
  expect(r.calls).toEqual(['GET', 'PUT v5']); expect(r.srv().plan?.why).toEqual(['mine'])
})

test('an edit made while signed in, before the first GET, carries the uid', async () => {
  const r = rig({ version: 0, plan: null }); r.edit({ whyNote: 'x' })
  expect(JSON.parse(mem.get(SYNC_KEY)!).uid).toBe('u1')
})

test('account switch while staying signed in: reconciles first, u1 plan never PUT under u2', async () => {
  const r = rig({ version: 0, plan: null }); r.s.start(); await r.s.idle()
  r.edit({ why: ['u1'] }); await settle(r)
  r.calls.length = 0
  r.a.uid = 'u2'; r.set('signed-in'); await r.s.idle()
  await settle(r)
  expect(r.calls[0]).toBe('GET')
  expect(r.calls.some(c => c.startsWith('PUT'))).toBe(false)
  expect(r.plan().why).toEqual(['u1'])  // adopted from the server, not pushed
})

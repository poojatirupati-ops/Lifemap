// Plan sync with ../api GET/PUT /api/plan. The local store stays the source of truth (offline = no-op).
// Wiring (T27 shell): a useEffect on usePlan() calls sync.changed(); sync.start() subscribes to the session.
import { auth } from '../identity/authClient.ts'
import { reconcile } from './carryOver.ts'
import { getPlan, KEY, setPlan } from './store.ts'
import { defaultPlan, type Plan } from './types.ts'

export const SYNC_KEY = 'lifemap.sync.v1'
const PATH = '/api/plan'

type Auth = {
  apiFetch: (path: string, init?: RequestInit) => Promise<Response>
  getState: () => { status: string; user?: { id: string } | null }
  subscribe: (l: () => void) => () => void
}
type Deps = { auth: Auth; getPlan: () => Plan; setPlan: (p: Partial<Plan>) => void; wait?: number }
type Meta = { version: number; dirty: boolean; uid?: string }   // uid: the account this device last synced with

export function createSync({ auth, getPlan, setPlan, wait = 1500 }: Deps) {
  const readMeta = (): Meta => {
    try { return { version: 0, dirty: false, ...JSON.parse(localStorage.getItem(SYNC_KEY) ?? '{}') } } catch { return { version: 0, dirty: false } }
  }
  const writeMeta = (m: Meta) => { try { localStorage.setItem(SYNC_KEY, JSON.stringify(m)) } catch { /* keep going in memory */ } }
  let meta = readMeta()
  let timer: ReturnType<typeof setTimeout> | undefined
  let ready = false   // reconciled with the server this sign-in; nothing is pushed before that
  let applying = false
  let applied: Plan | undefined   // the plan object this module set itself; the shell effect re-reporting it is not an edit
  let gen = 0         // bumped on sign-out, expiry and account switch; work started under an older one writes nothing
  let who = ''        // the account reconciled this sign-in
  let had = false     // has had a session since the last wipe
  let busy: Promise<void> = Promise.resolve()
  const live = () => auth.getState().status === 'signed-in'
  const save = (m: Partial<Meta>) => writeMeta((meta = { ...meta, ...m }))

  const quietly = (p: Partial<Plan>) => { applying = true; setPlan(p); applying = false; applied = getPlan() }
  const me = () => auth.getState().user?.id ?? ''
  /** True when the sign-in this work started under is gone (sign-out, expiry, other account). Check after every await. */
  const gone = (g: number, uid: string) => g !== gen || !live() || me() !== uid

  const get = async () => {
    const res = await auth.apiFetch(PATH)
    if (!res.ok) throw new Error('get')
    return (await res.json()) as { version: number; plan: Plan | null }
  }

  /** PUT the local plan; a 409 refetches the version and retries (local is newer: it is dirty). */
  async function push() {
    const g = gen, uid = me()
    for (let i = 0; i < 3 && !gone(g, uid); i++) {
      const local = getPlan()
      const plan = { ...local, fromPublic: false }
      const res = await auth.apiFetch(PATH, {
        method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ version: meta.version, plan }),
      })
      if (res.ok) {
        const { version } = (await res.json()) as { version: number }
        if (gone(g, uid)) return
        // ponytail: edits made while the PUT was in flight stay dirty via changed(); this only clears when nothing moved
        save({ version, dirty: getPlan() !== local })
        if (local.fromPublic) quietly({ fromPublic: false })
        return
      }
      if (res.status !== 409 || gone(g, uid)) return
      const fresh = (await get()).version
      if (gone(g, uid)) return
      save({ version: fresh })
    }
  }

  const run = (f: () => Promise<void>) => (busy = busy.then(f).catch(() => { /* offline or server blip: stay dirty, retry on next change */ }))

  /** Drop the local plan and sync state (sign-out, or a different account on this device). */
  function clearLocal() {
    gen++; clearTimeout(timer)
    quietly(defaultPlan())
    try { localStorage.removeItem(KEY); localStorage.removeItem(SYNC_KEY) } catch { /* ignore */ }
    meta = { version: 0, dirty: false }
  }

  /** Once per sign-in, before any push. Throws when the GET fails so the next change retries it. */
  async function reconcileNow() {
    if (ready || !live()) return
    const uid = auth.getState().user?.id ?? ''
    if (meta.uid && meta.uid !== uid) clearLocal()
    const g = gen
    const { version, plan } = await get()
    if (gone(g, uid)) return
    const baseline = meta.uid === uid && meta.version > 0
    if (reconcile(plan !== null, baseline, meta.dirty) === 'push') {
      save({ uid, version, dirty: true }); ready = true; who = uid; await push()
    } else {
      quietly({ ...(plan as Plan), fromPublic: false })
      save({ uid, version, dirty: false }); ready = true; who = uid
    }
  }

  /** Call after every local plan change. Debounced PUT; nothing is sent while signed out, expired or offline. */
  const changed = () => {
    if (applying || getPlan() === applied) return
    // uid is claimed only by an unowned plan; another account's plan is wiped by reconcile
    save(live() && !meta.uid ? { dirty: true, uid: me() } : { dirty: true })
    clearTimeout(timer)
    timer = setTimeout(() => void run(async () => { await reconcileNow(); if (ready && meta.dirty && live()) await push() }), wait)
  }

  const onSession = () => {
    const s = auth.getState().status
    if (s === 'signed-in') {
      had = true
      if (ready && me() !== who) { gen++; ready = false; clearTimeout(timer) }  // another account signed in without a sign-out between
      void run(reconcileNow)
    } else if (s === 'expired') { gen++; ready = false; clearTimeout(timer) } // paused until sign-in again
    else if (s === 'signed-out' && had) { ready = had = false; clearLocal() }  // unsynced edits are dropped with the plan
  }

  return { changed, start: () => { onSession(); return auth.subscribe(onSession) }, idle: () => busy }
}

export const sync = createSync({ auth, getPlan, setPlan })

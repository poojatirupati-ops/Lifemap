import { MutationObserver, QueryClient } from '@tanstack/react-query'
import { useShell } from '../state/shell.ts'
import { useStore } from '../state/store.ts'
import { savedPlan } from '../state/migrate.ts'
import type { Plan } from '../state/types.ts'
import { takeSnapshot } from '../state/versions.ts'

export interface SavedPlan {
  version: number
  plan: Plan | null
}

export const queryClient = new QueryClient()

export const PLAN_KEY = ['plan']
const SAVE_DELAY_MS = 1500

/** The plan as saved to the server; emailVerified is left out because it comes from the session. */
export function savedFields(plan: Plan) {
  const { emailVerified: _email, ...account } = plan.account
  return { ...plan, account }
}

export const send = (method: string, url: string, body?: unknown) =>
  fetch(url, {
    method,
    headers: body ? { 'content-type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  })

async function fetchPlan(): Promise<SavedPlan> {
  const response = await send('GET', '/api/plan')
  if (!response.ok) throw new Error(`plan ${response.status}`)
  const { version, plan }: { version: number; plan: unknown } = await response.json()
  return { version, plan: plan == null ? null : savedPlan.parse(plan) }
}

/** The signed-in user's saved plan and its version (the version is what a save compares against). */
export const loadPlan = () =>
  queryClient.fetchQuery({ queryKey: PLAN_KEY, queryFn: fetchPlan, staleTime: 0 })

/** Saves against the last version read; on 409 (changed elsewhere) refetches and retries once, last writer wins. */
async function putPlan(plan: object) {
  const snapshot = takeSnapshot() // kept across the 409 retry
  for (const attempt of [1, 2]) {
    const version = queryClient.getQueryData<SavedPlan>(PLAN_KEY)?.version ?? 0
    const response = await send('PUT', '/api/plan', { version, plan, snapshot })
    if (response.ok) {
      const saved: { version: number } = await response.json()
      queryClient.setQueryData(PLAN_KEY, { version: saved.version, plan })
      return
    }
    if (response.status !== 409 || attempt === 2) throw new Error(`plan ${response.status}`)
    await loadPlan()
  }
}

/**
 * Saves the plan 1.5s after it last changed, and at once when the page is hidden.
 * Offline saves wait and go out when the browser is online again; a failed save is retried on the next change.
 * Nothing is saved once signed out, so a reset plan never goes back, nor before the saved plan is restored. Returns the stop function.
 */
export function startPlanSync() {
  queryClient.mount() // resumes paused saves when the browser comes back online
  const saver = new MutationObserver(queryClient, { mutationFn: putPlan, scope: { id: 'plan' } })
  let lastSent = JSON.stringify(savedFields(useStore.getState().plan))
  let timer: ReturnType<typeof setTimeout> | undefined

  const save = () => {
    clearTimeout(timer)
    if (!useShell.getState().authed) return
    // no server version until the saved plan is restored (session.ts): this browser's plan never saves blind over the server's
    if (!queryClient.getQueryData(PLAN_KEY)) return
    const fields = savedFields(useStore.getState().plan)
    const json = JSON.stringify(fields)
    if (json === lastSent) return
    saver.mutate(fields).then(
      () => (lastSent = json),
      () => {}, // kept locally; the next change tries again
    )
  }
  const saveSoon = () => {
    clearTimeout(timer)
    timer = setTimeout(save, SAVE_DELAY_MS)
  }
  const saveIfHidden = () => {
    if (document.hidden) save()
  }

  const unsubscribe = useStore.subscribe((store, previous) => {
    if (store.plan !== previous.plan) saveSoon()
  })
  document.addEventListener('visibilitychange', saveIfHidden)
  return () => {
    clearTimeout(timer)
    unsubscribe()
    document.removeEventListener('visibilitychange', saveIfHidden)
    queryClient.unmount()
  }
}

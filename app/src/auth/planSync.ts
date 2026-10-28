import { MutationObserver, QueryClient } from '@tanstack/react-query'
import { toast } from '../state/shell.ts'
import { useStore } from '../state/store.ts'
import type { Plan } from '../state/types.ts'

export interface SavedPlan {
  version: number
  plan: Plan | null
}

export const queryClient = new QueryClient()
queryClient.mount() // resumes paused saves when the browser comes back online

const PLAN_KEY = ['plan']
const SAVE_DELAY_MS = 1500

/** Screen position, open panels and dev flags: not saved with the plan. */
const TRANSIENT = new Set(
  `scr tab planSeg planGo planEdit me exp sheet toast ask play upl pst after xs pb fsec from chapOpen
  tlOpen tlHl inflEdit meEdit rankMsg asmOpen setMsg csel admin wantPlan rt`.split(/\s+/),
)

/** The part of the plan saved to the server; ev/sv are left out because they come from the session. */
export function savedFields(plan: Plan) {
  const { name, email, mobile, c1, c2, pk } = plan.acct
  const kept = Object.entries(plan).filter(([key]) => !TRANSIENT.has(key))
  return { ...Object.fromEntries(kept), acct: { name, email, mobile, c1, c2, pk } }
}

const send = (method: string, url: string, body?: unknown) =>
  fetch(url, {
    method,
    credentials: 'same-origin',
    headers: body ? { 'content-type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  })

async function fetchPlan(): Promise<SavedPlan> {
  const response = await send('GET', '/api/plan')
  if (!response.ok) throw new Error(`plan ${response.status}`)
  return response.json()
}

/** The signed-in user's saved plan and its version (the version is what a save compares against). */
export const loadPlan = () =>
  queryClient.fetchQuery({ queryKey: PLAN_KEY, queryFn: fetchPlan, staleTime: 0 })

/** Saves against the last version read; on 409 (changed elsewhere) refetches and retries once, last writer wins. */
async function putPlan(plan: object) {
  for (const attempt of [1, 2]) {
    const version = queryClient.getQueryData<SavedPlan>(PLAN_KEY)?.version ?? 0
    const response = await send('PUT', '/api/plan', { version, plan })
    if (response.ok) {
      const saved: { version: number } = await response.json()
      queryClient.setQueryData(PLAN_KEY, { version: saved.version, plan })
      return
    }
    if (response.status !== 409 || attempt === 2) throw new Error(`plan ${response.status}`)
    await loadPlan()
  }
}

/** Bump when the privacy notice / terms or the reminders wording changes: the server stores which version was shown. */
export const NOTICE_VERSION = '2026-10'
export const MARKETING_VERSION = '2026-10'

/**
 * Records the notice acknowledgement (`terms`, contract basis) and the reminders consent, granted or withdrawn.
 * Tries 3 times; returns whether it was saved and tells the user when it was not.
 */
export async function postConsents({ terms, marketing }: { terms: boolean; marketing: boolean }) {
  const body = {
    notice: terms ? NOTICE_VERSION : undefined,
    marketing: { granted: marketing, version: MARKETING_VERSION },
  }
  for (const wait of [0, 1000, 3000]) {
    if (wait) await new Promise((resolve) => setTimeout(resolve, wait))
    const response = await send('POST', '/api/consents', body).catch(() => null)
    if (response?.ok) return true
  }
  toast("Your privacy choice couldn't be saved. Please try again.")
  return false
}

let stopSync: (() => void) | undefined

/**
 * Saves the plan 1.5s after it last changed, and at once when the page is hidden.
 * Offline saves wait and go out when the browser is online again; a failed save is retried on the next change.
 * One sync at a time; stop it with stopPlanSync.
 */
export function startPlanSync() {
  stopPlanSync()
  const saver = new MutationObserver(queryClient, { mutationFn: putPlan, scope: { id: 'plan' } })
  let lastSent = JSON.stringify(savedFields(useStore.getState().plan))
  let timer: ReturnType<typeof setTimeout> | undefined

  const save = () => {
    clearTimeout(timer)
    const json = JSON.stringify(savedFields(useStore.getState().plan))
    if (json === lastSent) return
    saver.mutate(JSON.parse(json)).then(
      () => (lastSent = json),
      () => {}, // kept locally; the next change tries again
    )
  }
  const saveSoon = () => {
    clearTimeout(timer)
    timer = setTimeout(save, SAVE_DELAY_MS)
  }
  const saveIfHidden = () => document.hidden && save()

  const unsubscribe = useStore.subscribe((store, previous) => {
    if (store.plan !== previous.plan) saveSoon()
  })
  document.addEventListener('visibilitychange', saveIfHidden)
  stopSync = () => {
    clearTimeout(timer)
    unsubscribe()
    document.removeEventListener('visibilitychange', saveIfHidden)
    stopSync = undefined
  }
}

/** Stops the running sync, if any; returns whether one was running. */
export function stopPlanSync() {
  const running = !!stopSync
  stopSync?.()
  return running
}

import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { authClient } from '../auth/client.ts'
import {
  ANALYTICS_VERSION,
  CONSENTS_KEY,
  consentsQuery,
  type ConsentState,
  saveConsents,
} from '../auth/consents.ts'
import { queryClient } from '../auth/planSync.ts'
import { tenantQuery } from '../shell/tenant.ts'
import { useShell } from '../state/shell.ts'
import { useStore } from '../state/store.ts'
import type { Plan } from '../state/types.ts'

/**
 * PostHog product analytics and session recording, only with the user's consent (GDPR + ePrivacy).
 * The server's consent record (GET /api/consents, kind "analytics") is the truth; without a grant,
 * and with the tenant's `analytics` flag off, posthog-js is not even downloaded, so it sends and stores nothing.
 * CSP (card P4): connect-src https://eu.i.posthog.com https://eu-assets.i.posthog.com; no script host
 * (the no-external build bundles the recorder and exception autocapture).
 */

export const ANALYTICS_LABEL =
  'Help improve LifeMap: anonymous usage analytics and session recordings'

const KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined

let posthog: Promise<typeof import('./posthog.ts')> | undefined

type Properties = Record<string, string | number | boolean | null>

/** Funnel events from before consent is known (Welcome and Discover come before the analytics choice). */
let held: [string, Properties][] = []
const HOLD_AT_MOST = 300
let capturing = false

/** The funnel events held until consent is known (tests read them). */
export const heldEvents = () => held

/**
 * Records a funnel event. Until the consent is known it is only held in this page's memory (never stored or sent):
 * sent once analytics is granted, dropped if it is refused.
 */
export function track(event: string, properties: Properties = {}) {
  if (capturing) void posthog?.then((module) => module.capture(event, properties))
  else if (held.length < HOLD_AT_MOST) held.push([event, properties])
}

/** Stops PostHog and clears its storage. Call on sign-out (also happens by itself when the session ends). */
function resetAnalytics() {
  capturing = false
  void posthog?.then((module) => module.stop())
}

/**
 * The plan's answers that are choices, as `question → answer` (option codes, keys and yes/no; never typed money,
 * names or dates). Each change is one `question_answered` event.
 */
function answersOf(plan: Plan): Properties {
  const each = (prefix: string, answers: Record<string, number | string>) =>
    Object.fromEntries(Object.entries(answers).map(([key, answer]) => [`${prefix}.${key}`, answer]))
  const set = (keys: string[]) => [...keys].sort().join(',')
  return {
    entry: plan.entry,
    why: set(plan.why),
    ...each('discover', plan.answers),
    partner: plan.about.partner,
    married: plan.about.married ?? null,
    dependants: plan.about.dependants,
    goals: set(plan.goals.map((goal) => goal.key)),
    ...each('finances', plan.entryMode),
    ...each('profile', plan.moneyProfile.answers),
    products: set(plan.moneyProfile.chips),
    growthSet: plan.assumptionSet,
  }
}

// ponytail: a change of more than this many answers at once is a plan being loaded or restored, not the customer answering
const ANSWERED_AT_ONCE = 2

/** The funnel: every screen the customer reaches (its journey id: D1, F2, P3-2, PLAN…) and every answer they give. */
export function watchFunnel() {
  // the first screen is shown (a layout effect) before this starts (an effect in the root)
  const first = useShell.getState().screenId
  if (first) track('screen_viewed', { screen: first })
  const screens = useShell.subscribe((shell, before) => {
    if (shell.screenId && shell.screenId !== before.screenId)
      track('screen_viewed', { screen: shell.screenId })
  })
  const answers = useStore.subscribe((store, before) => {
    if (store.plan === before.plan) return
    const [now, then] = [answersOf(store.plan), answersOf(before.plan)]
    const changed = Object.keys(now).filter((question) => now[question] !== then[question])
    if (changed.length > ANSWERED_AT_ONCE) return
    for (const question of changed)
      track('question_answered', {
        question,
        answer: now[question],
        screen: useShell.getState().screenId,
      })
  })
  return () => {
    screens()
    answers()
  }
}

/** Reports an error to PostHog error tracking; nothing happens without consent. */
export function captureException(error: unknown) {
  void posthog?.then((module) => module.captureException(error))
}

/** Records the analytics consent (grant or withdrawal) for the signed-in user; capture follows the saved state. */
export async function setAnalyticsConsent(granted: boolean) {
  void queryClient.cancelQueries({ queryKey: CONSENTS_KEY }) // a read in flight must not undo this choice
  const choose = (state?: ConsentState) =>
    state && {
      ...state,
      consents: { ...state.consents, analytics: { granted, version: ANALYTICS_VERSION } },
    }
  const previous = queryClient.setQueriesData<ConsentState>({ queryKey: CONSENTS_KEY }, choose)
  if (await saveConsents({ analytics: { granted, version: ANALYTICS_VERSION } })) return
  for (const [key, state] of previous) queryClient.setQueryData(key, state)
}

/** The signed-in user's analytics consent; null while loading or when the tenant has analytics off. */
export function useAnalyticsConsent() {
  const email = authClient.useSession().data?.user.email ?? ''
  const consent = useQuery({ ...consentsQuery(email), enabled: !!email }, queryClient).data
  const tenant = useQuery(tenantQuery, queryClient).data
  if (!consent || !tenant?.features.analytics) return null
  return consent.consents.analytics?.granted === true
}

/** Mount once (App): runs PostHog while signed in with consent in a tenant that allows it, and stops it otherwise. */
export function useAnalytics() {
  const session = authClient.useSession().data
  const userId = session?.user.id
  // the tenant the API scopes this session to (organization plugin field, not in the client's inferred type)
  const orgId = (session?.session as { activeOrganizationId?: string | null } | undefined)
    ?.activeOrganizationId
  const email = session?.user.email ?? ''
  const consent = useQuery({ ...consentsQuery(email), enabled: !!userId }, queryClient).data
  const tenantAnalytics = useQuery(tenantQuery, queryClient).data?.features.analytics
  const tenantAllows = tenantAnalytics === true
  const granted = consent?.consents.analytics?.granted === true && tenantAllows
  // a choice made (or a tenant without analytics): held funnel events are dropped, never sent
  const refused = consent?.consents.analytics?.granted === false || tenantAnalytics === false

  useEffect(watchFunnel, [])

  useEffect(() => {
    if (refused || !KEY) held = []
    if (!KEY || !userId || !orgId || !granted) return resetAnalytics()
    posthog ??= import('./posthog.ts')
    void posthog.then((module) => {
      module.start(KEY, userId, orgId)
      capturing = true
      for (const [event, properties] of held) module.capture(event, properties)
      held = []
    })
  }, [userId, orgId, granted, refused])
}

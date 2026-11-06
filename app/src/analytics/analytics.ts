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

/** Stops PostHog and clears its storage. Call on sign-out (also happens by itself when the session ends). */
function resetAnalytics() {
  void posthog?.then((module) => module.stop())
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
  const tenantAllows = useQuery(tenantQuery, queryClient).data?.features.analytics === true
  const granted = consent?.consents.analytics?.granted === true && tenantAllows

  useEffect(() => {
    if (!KEY || !userId || !orgId || !granted) return resetAnalytics()
    posthog ??= import('./posthog.ts')
    void posthog.then((module) => module.start(KEY, userId, orgId))
  }, [userId, orgId, granted])
}

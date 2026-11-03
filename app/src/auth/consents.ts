import { queryClient, send } from './planSync.ts'
import { toast } from '../state/shell.ts'

/** Bump when the privacy notice / terms or a consent's wording changes: the server stores which version was shown. */
export const NOTICE_VERSION = '2026-10'
export const MARKETING_VERSION = '2026-10'
export const ANALYTICS_VERSION = '2026-11'

interface Choices {
  terms: boolean
  marketing: boolean
  /** Anonymous usage analytics and session recordings; left out when this screen does not ask. */
  analytics?: boolean
}

/**
 * Records the notice acknowledgement (`terms`, contract basis) and the optional consents, granted or withdrawn.
 * Tries 3 times; returns whether it was saved and tells the user when it was not.
 */
export async function postConsents({ terms, marketing, analytics }: Choices) {
  const body = {
    notice: terms ? NOTICE_VERSION : undefined,
    marketing: { granted: marketing, version: MARKETING_VERSION },
    analytics:
      analytics === undefined ? undefined : { granted: analytics, version: ANALYTICS_VERSION },
  }
  for (const wait of [0, 1000, 3000]) {
    if (wait) await new Promise((resolve) => setTimeout(resolve, wait))
    const response = await send('POST', '/api/consents', body).catch(() => null)
    if (response?.ok) {
      void queryClient.invalidateQueries({ queryKey: CONSENTS_KEY }) // read by the analytics provider
      return true
    }
  }
  toast("Your privacy choice couldn't be saved. Please try again.")
  return false
}

/** GET /api/consents: the account's consent records in this tenant, and the privacy notice version it acknowledged (none when new). */
export interface ConsentState {
  consents: Partial<Record<string, { granted: boolean; version: string }>>
  notice?: string | null
}

export const CONSENTS_KEY = ['consents']
export const consentsQuery = {
  queryKey: CONSENTS_KEY,
  queryFn: async (): Promise<ConsentState> => {
    const response = await send('GET', '/api/consents')
    if (!response.ok) throw new Error(`consents ${response.status}`)
    return response.json()
  },
  staleTime: Infinity, // changes only by setAnalyticsConsent and postConsents (which invalidates it)
}

/**
 * Whether this account has acknowledged the privacy notice in this tenant (no means it is new here), read afresh. Offline it waits
 * for the connection; an API that is down is retried; rejects if it never answers.
 */
export const hasAcknowledgedNotice = async () =>
  !!(await queryClient.fetchQuery({ ...consentsQuery, staleTime: 0, retry: 3 })).notice

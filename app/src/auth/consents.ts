import { MutationObserver } from '@tanstack/react-query'
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
 * Returns whether it was saved.
 */
export const postConsents = ({ terms, marketing, analytics }: Choices) =>
  saveConsents({
    notice: terms ? NOTICE_VERSION : undefined,
    marketing: { granted: marketing, version: MARKETING_VERSION },
    analytics:
      analytics === undefined ? undefined : { granted: analytics, version: ANALYTICS_VERSION },
  })

/** POST /api/consents, tried 3 times; re-reads the consents when saved and tells the user when not. */
export async function saveConsents(body: object) {
  const saving = new MutationObserver(queryClient, {
    mutationFn: async () => {
      const response = await send('POST', '/api/consents', body)
      if (!response.ok) throw new Error(`consents ${response.status}`)
    },
    retry: 2,
    retryDelay: (failures) => [1000, 3000][failures],
    networkMode: 'always', // offline it fails at once and says so, rather than waiting on the details screen
  })
  const saved = await saving.mutate().then(
    () => true,
    () => false,
  )
  if (saved)
    void queryClient.invalidateQueries({ queryKey: CONSENTS_KEY }) // read by the analytics provider
  else toast("Your privacy choice couldn't be saved. Please try again.")
  return saved
}

/** GET /api/consents: the account's consent records in this tenant, and the privacy notice version it acknowledged (none when new). */
export interface ConsentState {
  consents: Partial<Record<string, { granted: boolean; version: string }>>
  notice?: string | null
}

/** Every account's consents (to remove them all); one account's are under ['consents', its email]. */
export const CONSENTS_KEY = ['consents']

/** The account's consents, so one account's answer is never read for another on the same browser. */
export const consentsQuery = (email: string) => ({
  queryKey: [...CONSENTS_KEY, email.toLowerCase()],
  queryFn: async (): Promise<ConsentState> => {
    const response = await send('GET', '/api/consents')
    if (!response.ok) throw new Error(`consents ${response.status}`)
    return response.json()
  },
  staleTime: Infinity, // changes only by setAnalyticsConsent and postConsents (which invalidates it)
})

/**
 * Whether this account has acknowledged the privacy notice in this tenant (no means it is new here), read afresh. Offline it waits
 * for the connection, and it keeps asking (backing off, paused while the page is hidden) until the API answers; it rejects only when
 * cancelled (sign-out).
 */
export const hasAcknowledgedNotice = async (email: string) =>
  !!(await queryClient.fetchQuery({ ...consentsQuery(email), staleTime: 0, retry: true })).notice

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
      void queryClient.invalidateQueries({ queryKey: ['consents'] }) // read by the analytics provider
      return true
    }
  }
  toast("Your privacy choice couldn't be saved. Please try again.")
  return false
}

/** Whether this account has acknowledged the privacy notice in this tenant (no means it is new here); null when the API could not say. */
export async function hasAcknowledgedNotice() {
  const response = await send('GET', '/api/consents').catch(() => null)
  if (!response?.ok) return null
  const state: { notice?: unknown } = await response.json()
  return !!state.notice
}

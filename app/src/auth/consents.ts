import { send } from './planSync.ts'
import { toast } from '../state/shell.ts'

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

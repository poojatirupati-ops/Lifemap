// Loaded only after analytics consent (see analytics.ts). The no-external build never loads PostHog's scripts,
// so the extensions it needs are bundled here and CSP needs no PostHog script host.
import posthog from 'posthog-js/no-external'
import 'posthog-js/dist/recorder'
import 'posthog-js/dist/exception-autocapture'

/** Starts capture and recording for this user in this tenant. Ids only: never email, name, money or dates. */
export function start(key: string, userId: string, orgId: string) {
  if (!posthog.__loaded) {
    posthog.init(key, {
      api_host: import.meta.env.VITE_POSTHOG_HOST ?? 'https://eu.i.posthog.com',
      person_profiles: 'identified_only',
      opt_out_capturing_by_default: true, // opted in below, from the server's consent record
      persistence: 'localStorage+cookie',
      cross_subdomain_cookie: false, // host-only cookie: tenants stay apart, and stop() can delete it
      autocapture: { dom_event_allowlist: ['click', 'submit'] }, // no input change events
      mask_all_text: true,
      mask_all_element_attributes: true,
      capture_exceptions: true,
      session_recording: {
        maskAllInputs: true,
        maskTextSelector: '*', // all text masked; unmasking safe static copy is a later, deliberate change
        recordHeaders: false,
        recordBody: false,
      },
    })
  }
  posthog.set_config({ disable_persistence: false }) // after a withdrawal in this page
  posthog.opt_in_capturing({ captureEventName: false })
  posthog.identify(userId)
  posthog.group('organization', orgId)
  posthog.startSessionRecording()
}

const POSTHOG_KEY = /^(ph_|__ph_)/

/** Stops everything and removes what PostHog stored in this browser. */
export function stop() {
  posthog.stopSessionRecording()
  posthog.reset() // also restores the default consent: opted out (opt_out_capturing_by_default)
  posthog.set_config({ disable_persistence: true }) // else it writes its storage again after the wipe below
  for (const storage of [localStorage, sessionStorage]) {
    for (const key of Object.keys(storage)) if (POSTHOG_KEY.test(key)) storage.removeItem(key)
  }
  for (const cookie of document.cookie.split('; ')) {
    const name = cookie.split('=')[0]
    if (POSTHOG_KEY.test(name)) document.cookie = `${name}=; Max-Age=0; path=/`
  }
}

export const captureException = (error: unknown) => posthog.captureException(error)

export const capture = (event: string, properties: Record<string, unknown>) =>
  posthog.capture(event, properties)

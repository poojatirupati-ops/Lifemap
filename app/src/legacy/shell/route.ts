import { flow } from './flow.data.ts'

// Route table types and the ONE guard. Pure: no react, no location.
export type Tab = 'home' | 'explore' | 'plan' | 'me' | 'experts'
/** Screens export `route`. Protected unless `public: true`. */
export type Route = { path: string; tab?: Tab; public?: boolean; root?: boolean }
export type Resolved = { to: string } | { show: Route } | { wait: true }
export type Status = 'loading' | 'signed-in' | 'signed-out' | 'expired'

const [START, SIGN_IN, HOME] = [flow[0], flow[4], flow[5]]
const safe = (p: string | null) => (p && p.startsWith('/') && !p.startsWith('//') ? p : null)

/** `hash` is location.hash without '#', e.g. "/plan" or "/sign-in?returnTo=/plan". */
export function resolve(hash: string, routes: Route[], status: Status): Resolved {
  const [path, qs = ''] = hash.split('?')
  const authed = status === 'signed-in'
  if (path === '/' || path === '') return { to: authed ? HOME : START }
  if (path === SIGN_IN && authed) return { to: safe(new URLSearchParams(qs).get('returnTo')) ?? HOME }
  const route = routes.find(r => r.path === path)
  if (route?.public) return { show: route }
  if (status === 'loading') return { wait: true }
  if (!authed) {
    const back = encodeURIComponent(qs ? `${path}?${qs}` : path).replace(/%2F/g, '/')
    return { to: `${SIGN_IN}?returnTo=${back}${status === 'expired' ? '&expired=1' : ''}` }
  }
  return route ? { show: route } : { to: HOME }
}

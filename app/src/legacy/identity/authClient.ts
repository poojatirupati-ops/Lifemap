// Session client for ../api (Better Auth REST). One fetch wrapper (`apiFetch`) for every client card.
export type User = { id: string; email: string; name?: string }
export type SessionState = { status: 'loading' | 'signed-in' | 'signed-out' | 'expired'; user: User | null }

type Fetch = typeof fetch
const b64u = (b: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const unb64u = (s: string) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))

export function createAuthClient(fetchFn: Fetch = (...a) => fetch(...a), base = '') {
  let state: SessionState = { status: 'loading', user: null }
  const listeners = new Set<() => void>()
  const set = (status: SessionState['status'], user: User | null = null) => {
    state = { status, user }
    listeners.forEach(l => l())
  }

  /** fetch with cookies; any 401 means the session is gone, so status flips to 'expired'. */
  const apiFetch = async (path: string, init: RequestInit = {}) => {
    const res = await fetchFn(base + path, { ...init, credentials: 'include' })
    if (res.status === 401 && state.status === 'signed-in') set('expired')
    return res
  }
  const post = (path: string, body?: unknown) =>
    apiFetch(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body ?? {}) })

  // Transient failure: keep a known session (offline PWA); lock only if we never had one.
  const blip = () => { if (state.status === 'loading') set('signed-out') }

  const getSession = async () => {
    try {
      const res = await apiFetch('/api/auth/get-session')
      if (!res.ok && res.status !== 401) return blip() // 5xx is a server blip, not a lapsed session
      const data = res.ok ? ((await res.json()) as { user?: User } | null) : null
      if (data?.user) set('signed-in', data.user)
      else set(state.status === 'signed-in' || state.status === 'expired' ? 'expired' : 'signed-out') // get-session answers 200/null for a lapsed session
    } catch {
      blip() // offline
    }
  }

  // Network failures resolve to false so callers never need a try/catch.
  const sendCode = async (email: string) => {
    try { return (await post('/api/auth/email-otp/send-verification-otp', { email, type: 'sign-in' })).ok } catch { return false }
  }

  /** Email-code sign-in; Better Auth creates the account on the first verified code, so sign-up is the same call. */
  const signIn = async (email: string, otp: string) => {
    try { if (!(await post('/api/auth/sign-in/email-otp', { email, otp })).ok) return false } catch { return false }
    await getSession()
    return state.status === 'signed-in'
  }

  // Browser WebAuthn directly (no @simplewebauthn/browser dependency).
  const signInWithPasskey = async () => {
    try {
      const res = await apiFetch('/api/auth/passkey/generate-authenticate-options')
      if (!res.ok) return false
      const o = (await res.json()) as { challenge: string; rpId?: string; timeout?: number; userVerification?: UserVerificationRequirement }
      const cred = (await navigator.credentials.get({
        publicKey: { challenge: unb64u(o.challenge), rpId: o.rpId, timeout: o.timeout, userVerification: o.userVerification },
      })) as PublicKeyCredential | null
      if (!cred) return false
      const r = cred.response as AuthenticatorAssertionResponse
      const response = {
        id: cred.id, rawId: b64u(cred.rawId), type: cred.type, clientExtensionResults: cred.getClientExtensionResults(),
        response: {
          authenticatorData: b64u(r.authenticatorData), clientDataJSON: b64u(r.clientDataJSON), signature: b64u(r.signature),
          userHandle: r.userHandle ? b64u(r.userHandle) : undefined,
        },
      }
      if (!(await post('/api/auth/passkey/verify-authentication', { response })).ok) return false
    } catch {
      return false // prompt cancelled (NotAllowedError), offline or malformed options
    }
    await getSession()
    return state.status === 'signed-in'
  }

  const signOut = async () => {
    await post('/api/auth/sign-out').catch(() => undefined)
    set('signed-out')
  }

  return {
    apiFetch, getSession, sendCode, signIn, signUp: signIn, signInWithPasskey, signOut,
    getState: () => state,
    subscribe: (l: () => void) => (listeners.add(l), () => void listeners.delete(l)),
  }
}

const env = (import.meta as { env?: { VITE_API_URL?: string } }).env
export const auth = createAuthClient(undefined, env?.VITE_API_URL ?? '')
export const apiFetch = auth.apiFetch

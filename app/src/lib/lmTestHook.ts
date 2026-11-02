/** Test-only sign-in bypass (screens.spec.ts): only on a local dev host with lm-test-auth set. */
function readFlag() {
  try {
    return localStorage.getItem('lm-test-auth')
  } catch {
    return null // private mode
  }
}

/** Test-only sign-in bypass: a local dev host with localStorage lm-test-auth set. */
export const testAuthOn = (host = globalThis.location?.hostname ?? '', flag = readFlag()) =>
  ['localhost', '127.0.0.1', '[::1]'].includes(host) && !!flag

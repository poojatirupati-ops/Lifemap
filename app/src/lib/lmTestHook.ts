/** Test-only sign-in bypass (screens.spec.ts): only on a local dev host with lm-test-auth set. */
function readFlag() {
  try {
    return localStorage.getItem('lm-test-auth')
  } catch {
    return null // private mode
  }
}

/**
 * Test-only sign-in bypass: a local dev host, localStorage lm-test-auth set, and an automated browser (Playwright sets
 * navigator.webdriver), so a flag left behind in a person's browser never lets them past the wall.
 */
export const testAuthOn = (
  host = globalThis.location?.hostname ?? '',
  flag = readFlag(),
  automated = !!globalThis.navigator?.webdriver,
) => ['localhost', '127.0.0.1', '[::1]'].includes(host) && !!flag && automated

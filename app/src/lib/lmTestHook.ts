// Test-only window.__lm for tools/view-equal.mjs: load a captured state (signed in), read it back,
// and go to a screen like the original's go(id). Only on a local dev host with lm-test-auth set.
import { signInForReview, startFrom } from '../state/shell.ts'
import { toSnapshot, useStore } from '../state/store.ts'
import type { Snapshot } from '../state/types.ts'

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

if (testAuthOn()) {
  Object.assign(window, {
    __lm: {
      load: (state: Snapshot) => {
        signInForReview()
        startFrom(structuredClone(state))
      },
      // JSON round trip, not structuredClone: view-equal compares it with the original's JSON.
      get: () => JSON.parse(JSON.stringify(toSnapshot(useStore.getState()))),
      go: (screen: string) => useStore.getState().go(screen),
    },
  })
}

// Test-only window.__lm for tools/view-equal.mjs: load a captured state (signed in), read it back,
// and go to a screen like the original's go(id). Only on a local dev host with lm-test-auth set.
import { startFrom } from '../state/shell.ts'
import { toSnapshot, useStore } from '../state/store.ts'
import type { Snapshot } from '../state/types.ts'

export const testHookOn = (host: string, flag: string | null) =>
  ['localhost', '127.0.0.1', '[::1]'].includes(host) && !!flag

function readFlag() {
  try {
    return localStorage.getItem('lm-test-auth')
  } catch {
    return null // private mode
  }
}

const signedIn = true

if (testHookOn(globalThis.location?.hostname ?? '', readFlag())) {
  Object.assign(window, {
    __lm: {
      load: (state: Snapshot) => startFrom(structuredClone(state), signedIn),
      // JSON round trip, not structuredClone: view-equal compares it with the original's JSON.
      get: () => JSON.parse(JSON.stringify(toSnapshot(useStore.getState()))),
      go: (screen: string) => useStore.getState().go(screen),
    },
  })
}

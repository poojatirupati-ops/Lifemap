import { useEffect, useSyncExternalStore } from 'react'
import { auth } from './authClient.ts'

/** {status: 'loading'|'signed-in'|'signed-out'|'expired', user}; checks the server session on first use. */
export function useSession() {
  useEffect(() => {
    if (auth.getState().status === 'loading') void auth.getSession()
  }, [])
  return useSyncExternalStore(auth.subscribe, auth.getState)
}

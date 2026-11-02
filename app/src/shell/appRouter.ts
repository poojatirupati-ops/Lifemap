import { createRouter } from '@tanstack/react-router'
import { routeTree } from '../routeTree.gen.ts'
import { setRouter } from './router.ts'

// Only main.tsx and the tests import this file: the route tree imports state, so state must not import it back (shell/router.ts).
// The original's reviewer jumps rebuild the whole screen state, so a screen's scroll is the app's (useScrollKeep), not the router's.
export const appRouter = createRouter({ routeTree, scrollRestoration: false })
setRouter(appRouter)

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof appRouter
  }
}

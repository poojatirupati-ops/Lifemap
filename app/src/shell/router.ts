import type { appRouter } from './appRouter.ts'

/** The app's router, set once by shell/appRouter.ts. A live binding, not an import of the route tree, so state can use it without an import cycle. */
export let router: typeof appRouter
export const setRouter = (created: typeof appRouter) => (router = created)

declare module '@tanstack/history' {
  interface HistoryState {
    /** Opened from another Explore page, so Back returns to it (state/explore.ts). */
    explore?: boolean
  }
}

/** Open a screen by its URL from outside React (store actions, sheets, sign-in). */
export const goTo = (href: string, replace = false) => router.navigate({ href, replace })

/** The current path, e.g. '/me/finances'. */
export const currentPath = () => router.state.location.pathname

/** The first part of the current path: 'me', 'experts', 'build', ... */
export const currentArea = () => currentPath().split('/')[1]

/** The plan report over the current screen (?report), so Back closes it. */
export const showReport = () => router.navigate({ to: '.', search: { report: true } })

export const closeReport = () => router.navigate({ to: '.', search: {}, replace: true })

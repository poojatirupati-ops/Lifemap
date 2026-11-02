// Renders the app at a URL, signed in, the way the screen tests open a screen.
import { act, render } from '@testing-library/react'
import { RouterProvider } from '@tanstack/react-router'
import { appRouter as router } from '../src/shell/appRouter.ts'
import { useShell } from '../src/state/shell.ts'
import Phone from '../src/shell/Phone.tsx'
import ReportHost from '../src/report/ReportHost.tsx'

// Only the stage with the phone, and the report: the reviewer panel's buttons would match the screen's
// queries, and the session, analytics and branding hooks would call the API.
router.routeTree.update({
  component: () => (
    <>
      <main className="stage">
        <Phone />
      </main>
      <ReportHost />
    </>
  ),
})

// jsdom has no IntersectionObserver; the foundation tiles (useFndWatch) wait on it
globalThis.IntersectionObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof IntersectionObserver

export async function renderAt(href: string) {
  useShell.setState({ authed: true })
  const view = render(<RouterProvider router={router} />)
  await act(() => router.navigate({ href }))
  return view
}

/** The page shown now, e.g. '/discover/2'. */
export const path = () => router.state.location.pathname

const tick = (ms = 0) => new Promise((done) => setTimeout(done, ms))

/** Lets a navigation started by a click finish (its page may still be loading its code). */
export const settle = () =>
  act(async () => {
    await tick()
    while (router.state.status !== 'idle' || router.state.isLoading) await tick(10)
  })

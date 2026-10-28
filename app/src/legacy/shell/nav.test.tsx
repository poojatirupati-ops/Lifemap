// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import Shell from './Shell.tsx'
import { canGoBack, direction, parent } from './nav.ts'
import type { Route } from './route.ts'

const page = (name: string) => () => <h1>{name}</h1>
const screens: { route: Route; Screen: () => React.JSX.Element }[] = [
  { route: { path: '/welcome', public: true, root: true }, Screen: page('Welcome') },
  { route: { path: '/why', public: true }, Screen: page('Why') },
  { route: { path: '/discover', public: true }, Screen: page('Discover') },
  { route: { path: '/sign-in', public: true }, Screen: page('SignIn') },
  { route: { path: '/home', tab: 'home' }, Screen: page('Home') },
  { route: { path: '/plan', tab: 'plan' }, Screen: page('Plan') },
]
const at = (h: string) => waitFor(() => expect(location.hash).toBe(h))

test('parent: one step up the flow, Discover steps down a question', () => {
  expect(parent('/why')).toBe('/welcome')
  expect(parent('/sign-in?returnTo=/plan')).toBe('/reveal')
  expect(parent('/discover?q=3')).toBe('/discover?q=2')
  expect(parent('/discover?q=1')).toBe('/discover')
  expect(parent('/discover')).toBe('/why')
  expect(parent('/sign-in?returnTo=/plan&step=code')).toBe('/sign-in?returnTo=/plan')
  expect(parent('/sign-in?step=code')).toBe('/sign-in')
  expect(parent('/other')).toBe('/home')
})

test('push, Back, guard redirect replaces, focus moves to the heading', async () => {
  location.hash = '#/welcome'
  render(<Shell screens={screens} status="signed-out" />)
  expect(screen.queryByRole('button', { name: 'Back' })).toBeNull() // root screen
  location.hash = '#/why'
  await screen.findByText('Why')
  await waitFor(() => expect(document.activeElement?.textContent).toBe('Why'))
  expect(canGoBack()).toBe(true)
  location.hash = '#/discover'
  await screen.findByText('Discover')
  fireEvent.click(screen.getByRole('button', { name: 'Back' }))
  await at('#/why')
  expect(direction()).toBe('back')
  expect(screen.getByText('Why')).toBeTruthy()
  // protected deep link: guard redirects with replace, so one Back leaves the app's sign-in instead of looping
  location.hash = '#/plan'
  await at('#/sign-in?returnTo=/plan')
  history.back()
  await at('#/why')
})

test('forward navigation scrolls to the top; fallback enter class follows direction; guard redirect never animates a blank', async () => {
  const start = vi.fn((cb: () => void) => { cb(); return { ready: Promise.resolve(), finished: Promise.resolve() } })
  const doc = document as unknown as Record<string, unknown>
  delete doc.startViewTransition
  location.hash = '#/welcome'
  await new Promise(r => setTimeout(r)) // let nav stamp this entry before the next push
  const { container } = render(<div className="app-scroll"><Shell screens={screens} status="signed-out" /></div>)
  const frame = container.querySelector('.app-scroll')!
  const top = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  frame.scrollTop = 900
  frame.scrollTo = ((_x: number, y: number) => { frame.scrollTop = y }) as typeof frame.scrollTo
  location.hash = '#/why'
  await screen.findByText('Why')
  expect(top).toHaveBeenCalledWith(0, 0)
  expect(frame.scrollTop).toBe(0)
  expect(container.querySelector('.screen')!.className).toContain('enter-forward')
  history.back()
  await screen.findByText('Welcome')
  expect(container.querySelector('.screen')!.className).toContain('enter-back')
  // signed-out push to a protected tab: the screen goes straight to sign-in, never through an empty Shell
  doc.startViewTransition = start
  location.hash = '#/plan'
  await at('#/sign-in?returnTo=/plan')
  await screen.findByText('SignIn')
  expect(start).toHaveBeenCalledTimes(1) // one Welcome > Sign-in transition, not Welcome > blank > Sign-in
  delete doc.startViewTransition
})

// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react'
import { expect, test } from 'vitest'
import Shell from './Shell.tsx'
import { resolve, type Route } from './route.ts'

const page = (name: string) => () => <h1>{name}</h1>
const screens: { route: Route; Screen: () => React.JSX.Element }[] = [
  { route: { path: '/welcome', public: true, root: true }, Screen: page('Welcome') },
  { route: { path: '/discover', public: true }, Screen: page('Discover') },
  { route: { path: '/sign-in', public: true }, Screen: page('SignIn') },
  { route: { path: '/home', tab: 'home' }, Screen: page('Home') },
  { route: { path: '/plan', tab: 'plan' }, Screen: page('Plan') },
]
const routes = screens.map(s => s.route)

test('resolve: guard, returnTo, expiry, open redirect', () => {
  expect(resolve('/plan', routes, 'signed-out')).toEqual({ to: '/sign-in?returnTo=/plan' })
  expect(resolve('/plan?x=1', routes, 'signed-out')).toEqual({ to: '/sign-in?returnTo=/plan%3Fx%3D1' })
  expect(resolve('/sign-in?returnTo=/plan%3Fx%3D1', routes, 'signed-in')).toEqual({ to: '/plan?x=1' })
  expect(resolve('/plan', routes, 'expired')).toEqual({ to: '/sign-in?returnTo=/plan&expired=1' })
  expect(resolve('/plan', routes, 'loading')).toEqual({ wait: true })
  expect(resolve('/welcome', routes, 'loading')).toEqual({ show: routes[0] })
  expect(resolve('/nope', routes, 'signed-in')).toEqual({ to: '/home' })
  expect(resolve('/sign-in?returnTo=/plan', routes, 'signed-in')).toEqual({ to: '/plan' })
  expect(resolve('/sign-in?returnTo=//evil.com', routes, 'signed-in')).toEqual({ to: '/home' })
  expect(resolve('', routes, 'signed-out')).toEqual({ to: '/welcome' })
})

test('deep link /plan signed-out goes to sign-in and returns after sign-in', async () => {
  location.hash = '#/plan'
  const { rerender } = render(<Shell screens={screens} status="signed-out" />)
  await waitFor(() => expect(location.hash).toBe('#/sign-in?returnTo=/plan'))
  expect(await screen.findByText('SignIn')).toBeTruthy()
  expect(screen.queryByRole('button', { name: 'Ask' })).toBeNull()
  rerender(<Shell screens={screens} status="signed-in" />)
  await waitFor(() => expect(location.hash).toBe('#/plan'))
  expect(await screen.findByText('Plan')).toBeTruthy()
})

test('expired session shows the calm note', async () => {
  location.hash = '#/plan'
  render(<Shell screens={screens} status="expired" />)
  await waitFor(() => expect(screen.getByRole('status').textContent).toContain('Your session ended'))
})

test('Ask hidden on /discover, visible with the tab bar on /home', async () => {
  location.hash = '#/discover'
  const { rerender } = render(<Shell screens={screens} status="signed-out" />)
  expect(screen.getByText('Discover')).toBeTruthy()
  expect(screen.queryByRole('button', { name: 'Ask' })).toBeNull()
  expect(screen.queryByRole('navigation')).toBeNull()
  location.hash = '#/home'
  rerender(<Shell screens={screens} status="signed-in" />)
  await waitFor(() => expect(screen.getByRole('button', { name: 'Ask' })).toBeTruthy())
  expect(screen.getAllByRole('link').map(l => l.textContent)).toEqual(['🏠Home', '🧭Explore', '🗺️My Plan', '🙂Me', '💬Experts'])
  expect(screen.getByRole('link', { name: 'Home' }).getAttribute('aria-current')).toBe('page')
})

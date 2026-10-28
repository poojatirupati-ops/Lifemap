// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import { useSession } from '../../identity/useSession.ts'
import SignIn, { route } from '../../screens/SignIn.tsx'
import Shell from '../../shell/Shell.tsx'
import SignOutButton from './SignOutButton.tsx'
import { SIGNUP_KEY } from './signIn.data.ts'

const Plan = () => <h1>Plan</h1>
const screens = [{ route, Screen: SignIn }, { route: { path: '/plan', tab: 'plan' as const }, Screen: Plan }]
const App = () => <Shell screens={screens} status={useSession().status} />

test('real Shell + SignIn + authClient: after the code step the hash is returnTo, details stored once', async () => {
  let signedIn = false
  vi.stubGlobal('fetch', vi.fn(async (url: string) => {
    if (url.endsWith('/sign-in/email-otp')) signedIn = true
    const body = url.endsWith('/get-session') ? (signedIn ? { user: { id: 'u', email: 'a@b.ie' } } : null) : {}
    return new Response(JSON.stringify(body), { status: 200 })
  }))
  localStorage.clear()
  location.hash = '#/plan'
  render(<App />)
  await waitFor(() => expect(location.hash).toBe('#/sign-in?returnTo=/plan'))
  fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'Aoife' } })
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.ie' } })
  fireEvent.click(screen.getAllByRole('checkbox')[0])
  fireEvent.click(screen.getByRole('button', { name: 'Send me a code' }))
  expect(localStorage.getItem(SIGNUP_KEY)).toBeNull()
  fireEvent.change(await screen.findByLabelText('6-digit code'), { target: { value: '123456' } })
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
  await waitFor(() => expect(location.hash).toBe('#/plan'))
  await new Promise(r => setTimeout(r, 20)) // a stray goBack would land on #/home
  expect(location.hash).toBe('#/plan')
  expect(JSON.parse(localStorage.getItem(SIGNUP_KEY)!).name).toBe('Aoife')
  fireEvent.click(render(<SignOutButton />).getByRole('button', { name: 'Sign out' }))
  expect(localStorage.getItem(SIGNUP_KEY)).toBeNull()
  vi.unstubAllGlobals()
})

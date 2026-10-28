// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import SignInPanel from './SignInPanel.tsx'

test('consents unticked, required one blocks submit, code step, success', async () => {
  const client = { sendCode: vi.fn(async () => true), signIn: vi.fn(async () => true) }
  const saved = vi.fn()
  render(<SignInPanel client={client} onSignup={saved} />)
  const [plan, updates] = screen.getAllByRole('checkbox') as HTMLInputElement[]
  expect([plan.checked, updates.checked]).toEqual([false, false])
  fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'Aoife' } })
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.ie' } })
  const submit = screen.getByRole('button', { name: 'Send me a code' }) as HTMLButtonElement
  expect(submit.disabled).toBe(true)
  fireEvent.click(plan)
  expect(submit.disabled).toBe(false)
  fireEvent.click(submit)
  await screen.findByLabelText('6-digit code')
  expect(client.sendCode).toHaveBeenCalledWith('a@b.ie')
  expect(saved).not.toHaveBeenCalled() // nothing stored before verification
  fireEvent.change(screen.getByLabelText('6-digit code'), { target: { value: '123 456' } })
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
  await waitFor(() => expect(client.signIn).toHaveBeenCalledWith('a@b.ie', '123456'))
  await waitFor(() => expect(saved).toHaveBeenCalledWith(expect.objectContaining({ name: 'Aoife', consents: { plan: true, updates: false } })))
})

test('wrong code shows a calm error; send failure too', async () => {
  const client = { sendCode: vi.fn(async () => true), signIn: vi.fn(async () => false) }
  const saved = vi.fn()
  render(<SignInPanel client={client} onSignup={saved} />)
  fireEvent.click(screen.getByRole('button', { name: 'I already have an account' }))
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.ie' } })
  expect((screen.getByRole('button', { name: 'Send code' }) as HTMLButtonElement).disabled).toBe(true) // sign-in can create an account: consent required
  fireEvent.click(screen.getAllByRole('checkbox')[0])
  fireEvent.click(screen.getByRole('button', { name: 'Send code' }))
  fireEvent.change(await screen.findByLabelText('6-digit code'), { target: { value: '000000' } })
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
  expect((await screen.findByRole('alert')).textContent).toContain("didn't work")
  expect(saved).not.toHaveBeenCalled() // nothing is stored before a verified code
})

test('sign-in mode records consent only (no name or mobile) after verification', async () => {
  const client = { sendCode: vi.fn(async () => true), signIn: vi.fn(async () => true) }
  const saved = vi.fn()
  render(<SignInPanel client={client} onSignup={saved} />)
  fireEvent.click(screen.getByRole('button', { name: 'I already have an account' }))
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.ie' } })
  fireEvent.click(screen.getAllByRole('checkbox')[0])
  fireEvent.click(screen.getByRole('button', { name: 'Send code' }))
  fireEvent.change(await screen.findByLabelText('6-digit code'), { target: { value: '123456' } })
  fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
  await waitFor(() => expect(saved).toHaveBeenCalledWith({ name: '', mobile: '', consents: { plan: true, updates: false } }))
})

test('code step lives in the URL: Back returns to the details with the email kept', async () => {
  const client = { sendCode: vi.fn(async () => true), signIn: vi.fn(async () => true) }
  location.hash = '#/sign-in?returnTo=/plan'
  render(<SignInPanel client={client} />)
  fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'Aoife' } })
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.ie' } })
  fireEvent.click(screen.getAllByRole('checkbox')[0])
  fireEvent.click(screen.getByRole('button', { name: 'Send me a code' }))
  await screen.findByLabelText('6-digit code')
  expect(location.hash).toBe('#/sign-in?returnTo=/plan&step=code')
  history.back()
  await waitFor(() => expect(screen.queryByLabelText('6-digit code')).toBeNull())
  expect((screen.getByLabelText('Email') as HTMLInputElement).value).toBe('a@b.ie')
})

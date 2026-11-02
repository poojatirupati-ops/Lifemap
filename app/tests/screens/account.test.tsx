// @vitest-environment jsdom
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, expect, test, vi } from 'vitest'
import { useStore } from '../../src/state/store.ts'
import { fresh } from '../../src/state/fresh.ts'
import { path, renderAt, settle } from '../renderAt.tsx'
import { prefillFinances } from '../../src/domain/finances/prefill.ts'

const auth = vi.hoisted(() => ({
  sendCode: vi.fn(async () => true),
  signInWithCode: vi.fn(async (): Promise<string | null> => null),
  addPasskey: vi.fn(async () => ({ error: null })),
  postConsents: vi.fn(async () => true),
  updateUser: vi.fn(async () => ({})),
  enterApp: vi.fn(async () => {}),
}))
vi.mock('../../src/auth/client.ts', () => ({
  sendCode: auth.sendCode,
  signInWithCode: auth.signInWithCode,
  authClient: { passkey: { addPasskey: auth.addPasskey }, updateUser: auth.updateUser },
}))
vi.mock('../../src/auth/consents.ts', () => ({ postConsents: auth.postConsents }))
vi.mock('../../src/auth/session.ts', async (original) => ({
  ...(await original<object>()),
  enterApp: auth.enterApp,
}))

test('prefillFinances keeps only what the customer already told us', () => {
  expect(prefillFinances({ name: 'Aoife', age: 16, retireAge: 66, retireSet: false })).toEqual({
    name: 'Aoife',
  })
  expect(prefillFinances({ name: '', age: 40, retireAge: 66, retireSet: true })).toEqual({
    age: 40,
    retireAge: 66,
  })
})

beforeEach(() => {
  vi.clearAllMocks()
  useStore.getState().load(fresh())
})

const type = (label: string, value: string) =>
  fireEvent.input(screen.getByLabelText(label), { target: { value } })

test('P1: Send waits for an email, then sends the code', async () => {
  await renderAt('/sign-in')
  const send = screen.getByText('Send my email code') as HTMLButtonElement
  expect(send.disabled).toBe(true)
  type('Email', 'aoife@example.ie')
  expect(send.disabled).toBe(false)
  fireEvent.click(send)
  await waitFor(() => expect(path()).toBe('/sign-in/code'))
  expect(auth.sendCode).toHaveBeenCalledWith('aoife@example.ie')
})

test('P1D: consents start unticked, the notice is required, all three are posted', async () => {
  await renderAt('/account/details')
  const boxes = screen.getAllByRole('checkbox') as HTMLInputElement[]
  expect(boxes.map((box) => box.checked)).toEqual([false, false, false])
  type('First name', ' Aoife ')
  fireEvent.click(screen.getByText('Continue'))
  await waitFor(() => expect(screen.getByRole('alert').textContent).toMatch(/required/))
  expect(auth.postConsents).not.toHaveBeenCalled()

  fireEvent.click(boxes[0])
  fireEvent.click(boxes[2])
  fireEvent.click(screen.getByText('Continue'))
  await waitFor(() => expect(path()).toBe('/account/passkey'))
  expect(auth.postConsents).toHaveBeenCalledWith({
    terms: true,
    marketing: false,
    analytics: true,
  })
  expect(auth.updateUser).toHaveBeenCalledWith({ name: 'Aoife' })
})

async function renderCodeScreen() {
  useStore.getState().update((plan) => {
    Object.assign(plan.account, {
      name: 'Aoife',
      email: 'a@b.ie',
      termsAccepted: true,
      marketingConsent: false,
    })
  })
  await renderAt('/sign-in/code')
  return screen.getAllByRole('textbox') as HTMLInputElement[]
}

test('P1E: boxes advance, short codes and wrong codes and lockout show their message', async () => {
  const boxes = await renderCodeScreen()
  expect(document.activeElement).toBe(boxes[0])
  fireEvent.input(boxes[0], { target: { value: 'x7' } })
  expect(boxes[0].value).toBe('7')
  expect(document.activeElement).toBe(boxes[1])

  fireEvent.click(screen.getByText('Verify'))
  expect(screen.getByRole('alert').textContent).toBe('Enter all 6 digits.')

  fireEvent.paste(boxes[0], { clipboardData: { getData: () => '123 456' } })
  expect(boxes.map((box) => box.value).join('')).toBe('123456')

  auth.signInWithCode.mockResolvedValueOnce("That code doesn't match. Try again.")
  fireEvent.keyDown(boxes[5], { key: 'Enter' })
  await waitFor(() =>
    expect(screen.getByRole('alert').textContent).toBe("That code doesn't match. Try again."),
  )
  auth.signInWithCode.mockResolvedValueOnce('Too many tries. Tap Send a new code.')
  fireEvent.click(screen.getByText('Verify'))
  await waitFor(() =>
    expect(screen.getByRole('alert').textContent).toBe('Too many tries. Tap Send a new code.'),
  )
  expect(path()).toBe('/sign-in/code')
  expect(auth.postConsents).not.toHaveBeenCalled()
})

test('P1E: the right code signs in and enters the app', async () => {
  const boxes = await renderCodeScreen()
  fireEvent.paste(boxes[0], { clipboardData: { getData: () => '654321' } })
  fireEvent.click(screen.getByText('Verify'))
  await waitFor(() => expect(auth.enterApp).toHaveBeenCalledWith({ name: '', email: 'a@b.ie' }))
  expect(auth.signInWithCode).toHaveBeenCalledWith('a@b.ie', '654321')
})

test('P1K: Not now (onboarded) returns to the page the wall caught; otherwise onboarding starts', async () => {
  useStore.getState().update((plan) => {
    plan.account.name = 'Aoife'
    plan.onboarded = true
  })
  const { unmount } = await renderAt('/account/passkey?redirect=%2Fexplore')
  fireEvent.click(screen.getByText('Not now'))
  await settle()
  expect(path()).toBe('/explore')
  expect(useStore.getState().plan.figures.name).toBe('Aoife')
  unmount()

  useStore.getState().load(fresh())
  await renderAt('/account/passkey')
  fireEvent.click(screen.getByText('Add Face ID / passkey'))
  await waitFor(() => expect(path()).toBe('/'))
  expect(useStore.getState().plan.account.passkey).toBe(true)
})

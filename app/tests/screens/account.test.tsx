// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, expect, test, vi } from 'vitest'
import { useStore } from '../../src/state/store.ts'
import { fresh } from '../../src/state/fresh.ts'
import * as Account from '../../src/screens/Account.screen.tsx'
import * as AccountCode from '../../src/screens/AccountCode.screen.tsx'
import * as AccountPasskey from '../../src/screens/AccountPasskey.screen.tsx'

const auth = vi.hoisted(() => ({
  sendCode: vi.fn(async () => true),
  signInWithCode: vi.fn(async (): Promise<string | null> => null),
  addPasskey: vi.fn(async () => ({ error: null })),
  postConsents: vi.fn(async () => {}),
  restoreSavedPlan: vi.fn(async () => false),
}))
vi.mock('../../src/auth/client.ts', () => ({
  sendCode: auth.sendCode,
  signInWithCode: auth.signInWithCode,
  authClient: { passkey: { addPasskey: auth.addPasskey } },
}))
vi.mock('../../src/auth/planSync.ts', () => ({ postConsents: auth.postConsents }))
vi.mock('../../src/auth/useWall.ts', () => ({ restoreSavedPlan: auth.restoreSavedPlan }))

beforeEach(() => {
  vi.clearAllMocks()
  useStore.getState().load({ ...fresh(), scr: 'P1' })
})

const type = (label: string, value: string) =>
  fireEvent.input(screen.getByLabelText(label), { target: { value } })

test('P1: consents start unticked and Send waits for every detail plus the required consent', async () => {
  render(
    <>
      <Account.Body />
      <Account.Foot />
    </>,
  )
  const send = screen.getByText('Send my email code') as HTMLButtonElement
  const [required, optional] = screen.getAllByRole('checkbox') as HTMLInputElement[]
  expect([required.checked, optional.checked]).toEqual([false, false])

  type('First name', 'Aoife')
  type('Email', 'aoife@example.ie')
  type('Mobile', '087 123 4567')
  expect(send.disabled).toBe(true)
  fireEvent.click(required)
  expect(send.disabled).toBe(false)

  fireEvent.click(send)
  await waitFor(() => expect(useStore.getState().screen).toBe('P1E'))
  expect(auth.sendCode).toHaveBeenCalledWith('aoife@example.ie')
})

function renderCodeScreen() {
  useStore.getState().update((plan) => {
    Object.assign(plan.acct, { name: 'Aoife', email: 'a@b.ie', c1: true, c2: false })
  })
  render(
    <>
      <AccountCode.Body />
      <AccountCode.Foot />
    </>,
  )
  return screen.getAllByRole('textbox') as HTMLInputElement[]
}

test('P1E: boxes advance, short codes and wrong codes and lockout show their message', async () => {
  const boxes = renderCodeScreen()
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
  expect(useStore.getState().screen).toBe('P1')
  expect(auth.postConsents).not.toHaveBeenCalled()
})

test('P1E: the right code signs in, posts consents, skips the phone step and offers a passkey', async () => {
  const boxes = renderCodeScreen()
  fireEvent.paste(boxes[0], { clipboardData: { getData: () => '654321' } })
  fireEvent.click(screen.getByText('Verify'))
  await waitFor(() => expect(useStore.getState().screen).toBe('P1K'))
  expect(auth.signInWithCode).toHaveBeenCalledWith('a@b.ie', '654321', 'Aoife')
  expect(auth.postConsents).toHaveBeenCalledWith({ terms: true, marketing: false })
  expect(auth.restoreSavedPlan).toHaveBeenCalledWith({ name: 'Aoife', email: 'a@b.ie' })
})

test('P1K: Not now returns to the screen the wall caught; a passkey goes on to P2', async () => {
  useStore.getState().update((plan) => {
    plan.rt = 'XPL'
    plan.acct.name = 'Aoife'
  })
  const { unmount } = render(<AccountPasskey.Foot />)
  fireEvent.click(screen.getByText('Not now'))
  expect(useStore.getState().plan.tab).toBe('explore')
  expect(useStore.getState().plan.rt).toBeUndefined()
  expect(useStore.getState().plan.fin.name).toBe('Aoife')
  unmount()

  render(<AccountPasskey.Foot />)
  fireEvent.click(screen.getByText('Add Face ID / passkey'))
  await waitFor(() => expect(useStore.getState().screen).toBe('P2'))
  expect(useStore.getState().plan.acct.pk).toBe(true)
})

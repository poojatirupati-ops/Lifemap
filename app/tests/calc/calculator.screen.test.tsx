// @vitest-environment jsdom
import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, expect, test, vi } from 'vitest'
import { useStore } from '../../src/state/store.ts'
import * as Calculator from '../../src/screens/Calculator.screen.tsx'
import * as Upload from '../../src/screens/ExploreUpload.screen.tsx'
import sample from '../../src/state/sample-plan.json'
import fresh from '../fixtures/fresh.json'

const plan = () => useStore.getState().plan

beforeEach(() => {
  vi.useFakeTimers()
  globalThis.matchMedia ??= (() => ({ matches: true })) as never
})

test('a result shows live, and a typed figure above the limit is capped with a hint', () => {
  useStore.getState().load({
    ...(sample as never),
    inflation: 0.025,
    tab: 'explore',
    explorePages: [{ page: 'CALC', param: 'retirement' }],
  })
  const { container } = render(<Calculator.Body param="retirement" />)
  expect(container.querySelector('#cout .eyebrow')!.textContent).toBe(
    "Illustrative gap (today's money)",
  )
  const box = container.querySelector<HTMLInputElement>('#co-pot')!
  fireEvent.input(box, { target: { value: '99,000,000' } })
  expect(plan().calcValues.retirement.pot).toBe(15000000)
  expect(screen.getByText('Max €15,000,000')).toBeTruthy()
  expect(container.querySelector<HTMLInputElement>('#c-pot')!.value).toBe('15000000')
})

test('without a mortgage rate the result waits, and the suggested rate fills it', () => {
  useStore.getState().load({ ...(fresh as never), explorePages: [{ page: 'CALC', param: 'repayment' }] })
  const { container } = render(<Calculator.Body param="repayment" />)
  expect(container.querySelector('#cgate b')!.textContent).toBe(
    'Choose your mortgage rate to see this',
  )
  fireEvent.click(container.querySelector('[data-a=ckstd][data-p=rate]')!)
  expect(container.querySelector('#cgate')).toBeNull()
  expect(plan().calcTouched.repayment).toEqual({ rate: true })
})

test('a statement is read, confirmed into Your finances and fills in its tool', () => {
  useStore.getState().load({
    ...(fresh as never),
    account: { ...(fresh as never as { acct: object }).acct, emailVerified: true, mobileVerified: true },
    inShell: true,
    tab: 'explore',
    explorePages: [{ page: 'XCAT', param: 'home' }],
  })
  act(() => useStore.getState().startStatement('home'))
  render(
    <>
      <Upload.Body />
      <Upload.Foot />
    </>,
  )
  act(() => void vi.runAllTimers())
  fireEvent.input(screen.getByLabelText('Outstanding balance'), { target: { value: '199000' } })
  fireEvent.click(screen.getByText('Looks right, fill in my tools'))
  expect([plan().figures.mortBal, plan().sources.mortBal, plan().fixed.mortBal]).toEqual([
    199000,
    'doc',
    true,
  ])
  expect(plan().explorePages).toEqual([
    { v: 'XCAT', p: 'home' },
    { v: 'CALC', p: 'repayment' },
  ])
  expect(plan().calcStatementKeys.repayment).toEqual(['loan', 'rate', 'term'])
})

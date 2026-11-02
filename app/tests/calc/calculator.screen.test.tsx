// @vitest-environment jsdom
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, expect, test } from 'vitest'
import { useStore } from '../../src/state/store.ts'
import { exploreBack } from '../../src/state/explore.ts'
import { path, renderAt, settle } from '../renderAt.tsx'
import sample from '../../src/state/sample-plan.json'
import fresh from '../fixtures/fresh.json'

const plan = () => useStore.getState().plan

beforeEach(() => {
  // reduced motion: the sample statement reads in 200ms
  globalThis.matchMedia ??= (() => ({ matches: true })) as never
})

test('a result shows live, and a typed figure above the limit is capped with a hint', async () => {
  useStore.getState().load({ ...(sample as never), inflation: 0.025 })
  const { container } = await renderAt('/explore/calculator/retirement')
  expect(container.querySelector('#cout .eyebrow')!.textContent).toBe(
    "Illustrative gap (today's money)",
  )
  const box = container.querySelector<HTMLInputElement>('#co-pot')!
  fireEvent.input(box, { target: { value: '99,000,000' } })
  expect(useStore.getState().calcValues.retirement.pot).toBe(15000000)
  expect(screen.getByText('Max €15,000,000')).toBeTruthy()
  expect(container.querySelector<HTMLInputElement>('#c-pot')!.value).toBe('15000000')
})

test('without a mortgage rate the result waits, and the suggested rate fills it', async () => {
  useStore.getState().load(fresh as never)
  const { container } = await renderAt('/explore/calculator/repayment')
  expect(container.querySelector('#cgate b')!.textContent).toBe(
    'Choose your mortgage rate to see this',
  )
  fireEvent.click(container.querySelector('[data-a=ckstd][data-p=rate]')!)
  expect(container.querySelector('#cgate')).toBeNull()
  expect(useStore.getState().calcTouched.repayment).toEqual({ rate: true })
})

test('a statement is read, confirmed into Your finances and fills in its tool', async () => {
  useStore.getState().load({
    ...(fresh as never),
    account: {
      ...(fresh as never as { acct: object }).acct,
      emailVerified: true,
    },
  })
  await renderAt('/explore/category/home')
  act(() => useStore.getState().startStatement('home'))
  await settle()
  expect(path()).toBe('/explore/statement')
  fireEvent.input(await screen.findByLabelText('Outstanding balance'), {
    target: { value: '199000' },
  })
  fireEvent.click(screen.getByText('Looks right, fill in my tools'))
  await settle()
  expect([plan().figures.mortBal, plan().sources.mortBal, plan().fixed.mortBal]).toEqual([
    199000,
    'doc',
    true,
  ])
  // the tool it filled, with its group under it in the history (Back)
  expect(path()).toBe('/explore/calculator/repayment')
  act(() => exploreBack())
  await waitFor(() => expect(path()).toBe('/explore/category/home'))
  expect(useStore.getState().calcStatementKeys.repayment).toEqual(['loan', 'rate', 'term'])
})

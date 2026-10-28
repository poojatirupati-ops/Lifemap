// @vitest-environment jsdom
import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, expect, test, vi } from 'vitest'
import { useStore } from '../../src/state/store.ts'
import * as Section from '../../src/screens/FinanceSection.screen.tsx'
import * as Upload from '../../src/screens/FinanceUpload.screen.tsx'
import partial from '../fixtures/finances-partial.json'

const plan = () => useStore.getState().plan

beforeEach(() => {
  vi.useFakeTimers()
  globalThis.matchMedia ??= (() => ({ matches: true })) as never
  useStore.getState().load({ ...(partial as never), scr: 'P2' })
})

const showSection = (index: number) => {
  act(() => useStore.getState().update((draft) => void (draft.fsec = index)))
  return render(
    <>
      <Section.Body />
      <Section.Foot />
    </>,
  )
}

test('P3 typed entry: a typed figure is used, a statement figure wins over a typed one', () => {
  showSection(1)
  fireEvent.input(screen.getByLabelText(/Monthly living costs/), { target: { value: '3,200' } })
  expect([plan().fin.costsM, plan().src.costsM]).toEqual([3200, 'typed'])
  expect(plan().src.work).toBe('doc')
  fireEvent.click(screen.getByText('Self-employed'))
  expect([plan().fin.work, plan().man.work]).toEqual([
    'Employed',
    { v: 'Self-employed', src: 'typed' },
  ])
  fireEvent.click(screen.getByText('Save this section'))
  expect(plan().saved.income).toBe(true)
  expect(useStore.getState().screen).toBe('P2')
})

test('P3 lists: a typed card feeds the total; Remove drops it', () => {
  showSection(3)
  const owed = document.querySelector<HTMLInputElement>("[data-it^='cards|'][data-it$='|owed']")!
  fireEvent.input(owed, { target: { value: '1200' } })
  expect(plan().fin.cardBal).toBe(1200)
  fireEvent.click(screen.getByLabelText('Remove Credit card 1'))
  expect(plan().lists.cards).toEqual([])
  expect(plan().fin.cardBal).toBeUndefined()
})

test('PU upload: a corrected figure is the statement figure; removing the statement brings back the typed one', () => {
  act(() =>
    useStore.getState().update((draft) => {
      draft.fin.cash = 8000
      draft.src.cash = 'typed'
    }),
  )
  const { unmount } = showSection(2)
  fireEvent.click(screen.getByText(/Upload$/))
  fireEvent.click(screen.getByText('Use a sample document'))
  unmount()
  expect(useStore.getState().screen).toBe('PU')
  act(() => vi.runAllTimers())
  const review = render(
    <>
      <Upload.Body />
      <Upload.Foot />
    </>,
  )
  fireEvent.input(screen.getByLabelText('Cash savings'), { target: { value: '9500' } })
  fireEvent.click(screen.getByText('Looks right, add them'))
  expect([plan().fin.cash, plan().src.cash, plan().fix.cash, plan().man.cash]).toEqual([
    9500,
    'doc',
    true,
    { v: 8000, src: 'typed' },
  ])
  expect(useStore.getState().screen).toBe('P2')
  review.unmount()

  showSection(2)
  fireEvent.click(screen.getByText(/Type it$/))
  fireEvent.click(screen.getByText('Remove statement'))
  expect([plan().fin.cash, plan().src.cash]).toEqual([8000, 'typed'])
})

// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import Discover from '../../screens/Discover.tsx'
import { DISCOVER } from '../../content/discover.data.ts'
import { getPlan } from '../../state/store.ts'

test('walks all 6 questions, the step is in the URL, store filled, no fetch', async () => {
  const f = vi.fn()
  vi.stubGlobal('fetch', f)
  expect(DISCOVER.map(q => q.id)).toEqual(['q2', 'q4', 'q7', 'q8', 'q9', 'q12'])
  location.hash = '#/discover'
  render(<Discover />)
  expect(screen.getByText('1 · Your money mindset')).toBeTruthy()
  const bar = screen.getByRole('progressbar')
  expect(bar.querySelectorAll('i').length).toBe(5)
  expect(bar.getAttribute('aria-valuenow')).toBe('1')
  expect(screen.getByText(DISCOVER[0]!.o[0]!.tag)).toBeTruthy()
  expect(screen.getByText(DISCOVER[0]!.o[0]!.line)).toBeTruthy()
  fireEvent.click(screen.getByText(DISCOVER[0]!.o[1]!.t))
  await waitFor(() => expect(screen.getByRole('heading').textContent).toBe(DISCOVER[1]!.q))
  expect(location.hash).toBe('#/discover?q=1')
  expect(bar.getAttribute('aria-valuenow')).toBe('2')
  expect(document.activeElement).toBe(screen.getByRole('heading'))
  history.back()
  await waitFor(() => expect(screen.getByRole('heading').textContent).toBe(DISCOVER[0]!.q))
  expect(screen.getByText(DISCOVER[0]!.o[1]!.t).closest('button')!.getAttribute('aria-pressed')).toBe('true')
  for (const q of DISCOVER) {
    await waitFor(() => expect(screen.getByRole('heading').textContent).toBe(q.q))
    if (q.id === 'q9') expect(screen.getByText('€8,500')).toBeTruthy()
    if (q.id === 'q12') expect(bar.getAttribute('aria-valuenow')).toBe('5')
    fireEvent.click(screen.getByText(q.o[2]!.t))
  }
  await waitFor(() => expect(location.hash).toBe('#/reveal'))
  expect(location.hash).toBe('#/reveal')
  expect(getPlan().fromPublic).toBe(true)
  expect(getPlan().ans).toEqual({ q2: 2, q4: 2, q7: 2, q8: 2, q9: 2, q12: 2 })
  expect(f).not.toHaveBeenCalled()
})

test('Q8 uses the Irish road wording', () => {
  expect(DISCOVER[3]!.o.map(o => o.t).join()).toContain('boreens')
})

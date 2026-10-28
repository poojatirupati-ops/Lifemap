// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import Reveal from './Reveal.tsx'
import { DISCOVER } from '../content/discover.data.ts'
import { DISC_FORMAL } from '../components/reveal/reveal.data.ts'
import { TYPES, SECT } from '../content/discover.data.ts'
import { personality } from '../engine/profile.ts'
import { setPlan } from '../state/store.ts'

test('renders from stored answers, CTA goes to sign-in, no fetch', () => {
  const f = vi.fn()
  vi.stubGlobal('fetch', f)
  setPlan({ ans: { q2: 0, q4: 1, q7: 1, q8: 2, q9: 2, q12: 2 } })
  render(<Reveal />)
  expect(screen.getByText(DISCOVER[0]!.o[0]!.tag)).toBeTruthy()
  expect(screen.getByText(DISCOVER[0]!.o[0]!.line)).toBeTruthy()
  expect(screen.getByText(/Risk comfort/)).toBeTruthy()
  expect(screen.getByText(/Cushion/)).toBeTruthy()
  expect(screen.getByText(/A first read, not advice/)).toBeTruthy()
  expect(screen.getByText(DISC_FORMAL)).toBeTruthy()
  const t = TYPES[personality({ q2: 0, q4: 1, q7: 1, q8: 2, q9: 2, q12: 2 })!.key]
  expect(screen.getByText(t.watch, { exact: false })).toBeTruthy()
  expect(screen.getByText(t.str.join(', '), { exact: false })).toBeTruthy()
  expect(screen.getByText(SECT.appetite[1])).toBeTruthy()
  expect(screen.getByText(/\(Thin buffer\)/)).toBeTruthy()
  expect(screen.queryByText(/\(Balanced\)/)).toBeNull()
  expect(screen.getByText('You might notice...')).toBeTruthy()
  expect(screen.getByText(/^You're open to ups and downs, but your emergency fund is thin\./)).toBeTruthy()
  fireEvent.click(screen.getByText('Get a more accurate picture: make my plan'))
  expect(location.hash).toBe('#/sign-in')
  expect(f).not.toHaveBeenCalled()
})

test('too few answers: asks for more, no type shown', () => {
  setPlan({ ans: {} })
  render(<Reveal />)
  expect(screen.getByText('A few more answers')).toBeTruthy()
  expect(screen.queryByText(/A first read/)).toBeNull()
  expect(screen.queryByText(/make my plan/)).toBeNull()
  fireEvent.click(screen.getByText('Back to the questions'))
  expect(location.hash).toBe('#/discover')
})

test('q8 tag shown beside the comfort word when it differs', () => {
  setPlan({ ans: { q2: 0, q4: 1, q7: 1, q8: 3, q9: 2, q12: 2 } })
  render(<Reveal />)
  expect(screen.getByText(/\(High risk\)/)).toBeTruthy()
})

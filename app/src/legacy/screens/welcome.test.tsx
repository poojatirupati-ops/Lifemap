// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, expect, test, vi } from 'vitest'
import Welcome from './Welcome.tsx'
import WhyHere from './WhyHere.tsx'
import { getPlan, reload } from '../state/store.ts'

beforeEach(() => { localStorage.clear(); reload(); location.hash = '' })

test('cover shows only the specified text and two links', () => {
  const { container } = render(<Welcome />)
  expect(container.textContent).toBe(
    "LifeMapThe life you'd like, mapped out.A life map that guides you, step by step.Let's startAn easy tool, built for you.I have an invite·Why we ask",
  )
  expect(screen.getAllByRole('button').map(b => b.textContent)).toEqual(["Let's start", 'I have an invite', 'Why we ask'])
  expect(screen.getByRole('heading', { name: "The life you'd like, mapped out." })).toBeTruthy()
  fireEvent.click(screen.getByText("Let's start"))
  expect(location.hash).toBe('#/why')
})

HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) { this.setAttribute('open', '') }

test('the invite code is kept as the entry source, nothing is fetched', () => {
  const fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
  render(<Welcome />)
  fireEvent.click(screen.getByText('I have an invite'))
  fireEvent.change(screen.getByLabelText(/Code/), { target: { value: 'ABC123' } })
  expect(screen.getByLabelText(/Code/).getAttribute('maxlength')).toBe('20')
  fireEvent.click(screen.getByText('Continue'))
  expect(getPlan().entry).toBe('adviser invite ABC123')
  expect(screen.getByText('Invite linked')).toBeTruthy()
  expect(fetchMock).not.toHaveBeenCalled()
})

test('chips are optional; answering fills the store with no fetch', () => {
  const fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
  render(<WhyHere />)
  expect((screen.getByText('Continue') as HTMLButtonElement).disabled).toBe(true)
  fireEvent.click(screen.getByText('Skip'))
  expect(location.hash).toBe('#/discover')
  expect(getPlan().why).toEqual([])
  fireEvent.click(screen.getByText(/Emergency fund/))
  fireEvent.click(screen.getByText('Something else'))
  fireEvent.change(screen.getByLabelText('Something else', { selector: 'input' }), { target: { value: 'New baby' } })
  expect(getPlan().why).toEqual(['safety', 'other'])
  expect(getPlan().whyNote).toBe('New baby')
  expect(fetchMock).not.toHaveBeenCalled()
  expect(screen.getByLabelText('Something else', { selector: 'input' }).getAttribute('maxlength')).toBe('60')
  fireEvent.click(screen.getByText('Continue'))
  expect(location.hash).toBe('#/discover')
  fireEvent.click(screen.getByText('Something else'))
  expect(getPlan().whyNote).toBe('')
})

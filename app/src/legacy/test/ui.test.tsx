// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import Emoji from '../components/ui/Emoji.tsx'
import Chip from '../components/ui/Chip.tsx'
import Sheet from '../components/ui/Sheet.tsx'
import NumberField from '../components/ui/NumberField.tsx'

test('Emoji is hidden from the accessibility tree', () => {
  render(<button><Emoji>🏡</Emoji>Home</button>)
  expect(screen.getByRole('button', { name: 'Home' })).toBeTruthy()
  expect(screen.queryByText('🏡')?.getAttribute('aria-hidden')).toBe('true')
})

test('NumberField unit sits outside the typing area, so a 12-digit value cannot run under it', () => {
  render(<NumberField label="Savings" value="123456789012" onChange={() => {}} unit="a month" />)
  const input = screen.getByLabelText('Savings')
  const unit = screen.getByText('a month')
  expect(input.contains(unit)).toBe(false)
  expect(unit.parentElement).toBe(input.parentElement) // flex siblings: the input shrinks, the unit keeps its width
  expect((input as HTMLInputElement).value).toBe('123456789012')
})

test('NumberField links its unit and keeps at most one dot', () => {
  const onChange = vi.fn()
  render(<NumberField label="Rate" value="" onChange={onChange} unit="%" />)
  const input = screen.getByLabelText('Rate')
  expect(input.getAttribute('aria-describedby')).toBe(screen.getByText('%').id)
  fireEvent.change(input, { target: { value: '1.2.3x' } })
  expect(onChange).toHaveBeenCalledWith('1.23')
})

test('Chip exposes aria-pressed', () => {
  render(<Chip selected>Yes</Chip>)
  expect(screen.getByRole('button', { name: 'Yes' }).getAttribute('aria-pressed')).toBe('true')
})

test('Sheet opens modally and Escape (cancel) calls onClose', () => {
  const showModal = vi.fn(function (this: HTMLDialogElement) { this.setAttribute('open', '') })
  HTMLDialogElement.prototype.showModal = showModal // jsdom has no showModal
  const onClose = vi.fn()
  render(<Sheet open title="Details" onClose={onClose}>x</Sheet>)
  expect(showModal).toHaveBeenCalled()
  fireEvent(screen.getByRole('dialog', { name: 'Details' }), new Event('cancel', { cancelable: true }))
  expect(onClose).toHaveBeenCalledTimes(1)
})

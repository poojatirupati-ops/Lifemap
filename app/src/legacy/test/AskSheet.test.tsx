// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import { useState } from 'react'
import AskSheet from '../components/ask/AskSheet.tsx'

function Host() {
  const [open, setOpen] = useState(false)
  return (<><button onClick={() => setOpen(true)}>Ask</button><AskSheet open={open} onClose={() => setOpen(false)} /></>)
}

test('opens, lists answers, closes on cancel (Escape), focus returns', () => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute('open', '')
    this.querySelector('button')?.focus() // like real showModal: focus moves into the dialog
  }) // jsdom has no showModal
  render(<Host />)
  const btn = screen.getByRole('button', { name: 'Ask' })
  btn.focus()
  fireEvent.click(btn)
  expect(screen.getByText('What is LifeMap?')).toBeTruthy()
  expect(screen.getByText('Inflation')).toBeTruthy()
  expect(screen.getByText('Guidance, not advice.')).toBeTruthy()
  expect(document.activeElement?.textContent).toBe('Close') // focus really moved into the dialog
  fireEvent(screen.getByRole('dialog', { name: 'Ask' }), new Event('cancel', { cancelable: true }))
  expect(screen.queryByRole('dialog')).toBeNull()
  expect(document.activeElement).toBe(btn)
})

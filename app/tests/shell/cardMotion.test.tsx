// @vitest-environment jsdom
import { useRef, type ReactNode } from 'react'
import { fireEvent, render } from '@testing-library/react'
import { expect, it } from 'vitest'
import { useRipple } from '../../src/hooks/useRipple.ts'
import { useTilt } from '../../src/hooks/useTilt.ts'

function Host({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useRipple(ref)
  useTilt(ref)
  return (
    <div id="screen" ref={ref}>
      {children}
    </div>
  )
}

it('ripples a tapped quiz answer and fades the others back', () => {
  const { container } = render(
    <Host>
      <div className="qbody qcenter">
        <div className="opts">
          <button className="opt">A</button>
        </div>
      </div>
    </Host>,
  )
  fireEvent.pointerDown(container.querySelector('.opt')!)
  expect(container.querySelector('.opt .ripple')).not.toBeNull()
  expect(container.querySelector('.opts')!.classList.contains('picked')).toBe(true)
})

it('tilts a photo card under the pointer and settles it when the pointer leaves', () => {
  const { container } = render(
    <Host>
      <div className="hcard">
        <span className="inner" />
      </div>
    </Host>,
  )
  const card = container.querySelector<HTMLElement>('.hcard')!
  fireEvent.pointerMove(container.querySelector('.inner')!)
  expect(card.classList.contains('tilting')).toBe(true)
  expect(card.style.getPropertyValue('--ry')).toMatch(/deg$/)
  fireEvent.pointerOut(card, { relatedTarget: document.body })
  expect(card.classList.contains('tilting')).toBe(false)
  expect(card.style.getPropertyValue('--ry')).toBe('')
})

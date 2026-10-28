// The borrowing quiz shows the same questions and estimates as the ORIGINAL's eligHTML().
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { expect, it } from 'vitest'
import { rendered, shape } from './dom'
import { runOriginal } from '../golden/origSlice'
import EligibilityQuestion from '../../src/sheets/EligibilityQuestion'
import EligibilityResult from '../../src/sheets/EligibilityResult'
import * as Elig from '../../src/sheets/elig.sheet'

const original = runOriginal('fresh, eligHTML')
const theirs = (index: number, answers: number[]) => {
  original.setState({ ...original.fresh(), elig: { i: index, a: answers } })
  // inside the sheet, the heading names the dialog
  return shape(original.eligHTML().replace('<h2 class="t"', '<h2 class="t" id="sheet-t"'))
}
const noop = () => {}

it('every question, with and without an answer picked', () => {
  for (let index = 0; index < 4; index++)
    for (const answer of [undefined, 0, 1]) {
      const answers = answer == null ? [] : Object.assign([], { [index]: answer })
      const ours = rendered(
        <EligibilityQuestion index={index} answer={answer} onPick={noop} onBack={noop} />,
      )
      expect(shape(ours)).toEqual(theirs(index, answers))
    }
})

it('every estimate', () => {
  for (const alone of [0, 1])
    for (const first of [0, 1])
      for (const income of [0, 1, 2, 3])
        for (const deposit of [0, 1, 2, 3]) {
          const answers = [alone, first, income, deposit]
          const ours = rendered(<EligibilityResult answers={answers} onRestart={noop} />)
          expect(shape(ours)).toEqual(theirs(4, answers))
        }
})

it('answers move on, Back goes back, Start again starts over', () => {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  act(() => root.render(<Elig.Body />))
  const pick = (index: number) =>
    act(() => container.querySelectorAll<HTMLButtonElement>('.elq-b')[index].click())
  const question = () => container.querySelector('h2')?.textContent
  pick(1)
  expect(question()).toBe('Is this your first home?')
  act(() => container.querySelector<HTMLButtonElement>('.link')!.click())
  expect(container.querySelector('.elq-b.sel')?.textContent).toContain('With a partner')
  pick(0)
  pick(0)
  pick(2)
  pick(3)
  expect(question()).toBe('You could borrow about')
  act(() =>
    [...container.querySelectorAll('button')].find((b) => b.textContent === 'Start again')!.click(),
  )
  expect(question()).toBe('Are you buying on your own?')
  act(() => root.unmount())
  container.remove()
})

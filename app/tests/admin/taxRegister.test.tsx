// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, test } from 'vitest'
import TaxRegister from '../../src/components/admin/TaxRegister.tsx'
import { taxSession } from '../../src/domain/planning/rates.ts'

const valueOf = (path: string) => taxSession.getState().overrides[path]?.value

/** Type a 2027 value and leave the box. */
function enter(name: RegExp, typed: string) {
  const input = screen.getByLabelText(name)
  fireEvent.input(input, { target: { value: typed } })
  fireEvent.blur(input)
}

afterEach(() => taxSession.setState(taxSession.getInitialState(), true))

test('a number rule takes only numbers: euros, commas and percents are read, anything else is refused', () => {
  render(<TaxRegister />)
  enter(/^2027 value for Standard-rate band, single/, 'about 47k')
  expect(screen.getByRole('alert').textContent).toMatch(/not a number/)
  expect(taxSession.getState().overrides).toEqual({})

  enter(/^2027 value for Standard-rate band, single/, '€47,000')
  expect(valueOf('it.band')).toBe(47000)
  expect(screen.queryByRole('alert')).toBeNull()

  enter(/^2027 value for Exit tax/, '36%')
  expect(valueOf('sav.exit')).toBe(0.36)
})

test('a rate shows as a percent, and a bare number of 1 or more is read as a percent', () => {
  render(<TaxRegister />)
  const box = () => screen.getByLabelText<HTMLInputElement>(/^2027 value for Exit tax/)
  expect(box().value).toBe('35%')
  enter(/^2027 value for Exit tax/, '33')
  expect(valueOf('sav.exit')).toBe(0.33)
  expect(box().value).toBe('33%')
  enter(/^2027 value for Exit tax/, '0.3')
  expect(valueOf('sav.exit')).toBe(0.3)
})

test('a text rule keeps the text', () => {
  render(<TaxRegister />)
  enter(/^2027 value for Investment Account: start date/, '2027-09-01')
  expect(valueOf('ia.start')).toBe('2027-09-01')
})

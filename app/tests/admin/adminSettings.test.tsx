// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, expect, test } from 'vitest'
import { Body } from '../../src/screens/AdminSettings.screen.tsx'
import { useSettings } from '../../src/components/admin/settingsStore.ts'

/** Type into an input and leave it. */
function enter(input: HTMLElement, value: string) {
  fireEvent.input(input, { target: { value } })
  fireEvent.blur(input)
}

beforeEach(() => {
  useSettings.getState().backToStandards()
})

test('typed and picked partner figures are taken; a list keeps the standard for blank items', () => {
  render(<Body />)
  enter(screen.getByLabelText(/^Partner name/), ' Acme CU ')
  enter(screen.getByLabelText(/^Partner figure 3 for Risk and return: growth/), '8')
  fireEvent.change(screen.getByLabelText('Partner figure for How you draw your pension'), {
    target: { value: 'min' },
  })
  const { settings } = useSettings.getState()
  const riskMu = settings.standards.riskMu.value as number[]
  expect(settings.partner).toBe('Acme CU')
  expect(settings.standards.riskMu.partnerValue).toEqual([riskMu[0], riskMu[1], 0.08])
  expect(settings.standards.drawRule.partnerValue).toBe('min')
  expect(screen.getAllByText('Changed by Acme CU')).toHaveLength(2)

  fireEvent.click(screen.getByText('Back to the LifeMap standards'))
  expect(screen.queryByText('Changed by Acme CU')).toBeNull()
  expect((screen.getByLabelText(/^Partner name/) as HTMLInputElement).value).toBe('')
})

test('refuses a figure outside the limits, says why, and keeps the standard', () => {
  render(<Body />)
  const input = screen.getByLabelText(
    'Partner figure for Pay rises (a year) (%)',
  ) as HTMLInputElement
  enter(input, '9')
  expect(screen.getByRole('alert').textContent).toBe(
    'That figure is outside the allowed range, so it was not used. Allowed: 0% to 6%.',
  )
  expect(input.value).toBe('')
  expect(useSettings.getState().settings.standards.wage.partnerValue).toBeUndefined()

  enter(input, '5')
  expect(screen.queryByRole('alert')).toBeNull()
  expect(screen.getByText('Changed by your provider')).toBeTruthy()

  fireEvent.click(screen.getByText('Reset'))
  expect(useSettings.getState().settings.standards.wage.partnerValue).toBeUndefined()
  expect(screen.queryByText('Back to the LifeMap standards')).toBeNull()
})

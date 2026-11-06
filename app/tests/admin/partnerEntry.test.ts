import { expect, test } from 'vitest'
import { readEntry } from '../../src/domain/planning/partnerFigure'
import { STANDARDS } from '../../src/domain/planning/settings.data'

const standard = (key: string) => (STANDARDS as Record<string, any>)[key]

test('only a blank box clears a partner figure; text that is not a number is refused', () => {
  expect(readEntry('cashYears', standard('cashYears'), '  ')).toEqual({ figure: null })
  expect(readEntry('cashYears', standard('cashYears'), 'soon')).toEqual({ refused: 'notNumber' })
  expect(readEntry('cashYears', standard('cashYears'), '3 years')).toEqual({ figure: 3 })
})

test('a rate of the list that is not a number is refused, not reset to the standard', () => {
  const riskMu = standard('riskMu')
  expect(readEntry('riskMu', riskMu, 'high', 2)).toEqual({ refused: 'notNumber' })
  expect(readEntry('riskMu', riskMu, '', 2)).toEqual({ figure: null })
})

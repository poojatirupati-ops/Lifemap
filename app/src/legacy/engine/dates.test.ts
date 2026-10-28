import { expect, test } from 'vitest'
import { ageInYear, ageToday, confirmationLine, goalLabel, parseDob, sampleDob, validateDob, yearAtAge } from './dates'

const now = new Date(2026, 9, 26)   // 26 Oct 2026

test('age today on birthday, day before, day after, 29 Feb', () => {
  expect(ageToday({ y: 1999, m: 10, d: 26 }, now)).toBe(27)
  expect(ageToday({ y: 1999, m: 10, d: 27 }, now)).toBe(26)
  expect(ageToday({ y: 1999, m: 10, d: 25 }, now)).toBe(27)
  expect(ageToday({ y: 2000, m: 2, d: 29 }, new Date(2027, 1, 28))).toBe(26)
  expect(ageToday({ y: 2000, m: 2, d: 29 }, new Date(2027, 2, 1))).toBe(27)
  expect(ageToday({ y: 2000, m: 2, d: 29 }, new Date(2028, 1, 29))).toBe(28)
})

test('validation', () => {
  expect(validateDob({ y: 1999, m: 8, d: 21 }, now)).toBeNull()
  expect(validateDob({ y: 2009, m: 10, d: 27 }, now)).toMatch(/18 to 80/)   // 16... turns 17 tomorrow
  expect(validateDob({ y: 2009, m: 10, d: 26 }, now)).toMatch(/18 to 80/)   // 17
  expect(validateDob({ y: 2008, m: 10, d: 26 }, now)).toBeNull()            // 18 today
  expect(validateDob({ y: 1945, m: 10, d: 26 }, now)).toMatch(/18 to 80/)   // 81
  expect(validateDob({ y: 1946, m: 10, d: 26 }, now)).toBeNull()            // 80
  expect(validateDob({ y: 2001, m: 2, d: 29 }, now)).toMatch(/does not exist/)
  expect(validateDob({ y: 2027, m: 1, d: 1 }, now)).toBe('That date is in the future')
  expect(validateDob(undefined, now)).toBeTruthy()
  expect(validateDob(undefined, now, true)).toBeNull()
})

test('confirmation line', () => {
  expect(confirmationLine('Pooja', { y: 1999, m: 8, d: 21 }, now)).toBe("Thanks, Pooja. You're 27 today and turn 28 on 21 August 2027.")
  expect(confirmationLine(undefined, { y: 1999, m: 10, d: 27 }, now)).toBe("Thanks. You're 26 today and turn 27 on 27 October 2026.")
  expect(confirmationLine(undefined, { y: 1999, m: 10, d: 26 }, now)).toBe("Thanks. You're 27 today and turn 28 on 26 October 2027.")
  // 29 Feb birthday in a non-leap year falls on 1 March
  expect(confirmationLine(undefined, { y: 2000, m: 2, d: 29 }, now)).toBe("Thanks. You're 26 today and turn 27 on 1 March 2027.")
})

test('parseDob', () => {
  expect(parseDob('1999-08-21')).toEqual({ y: 1999, m: 8, d: 21 })
  for (const bad of ['', '1999-8-21', '21/08/1999', '2001-02-29', '1999-13-01', '1999-08-21T00:00']) expect(parseDob(bad)).toBeUndefined()
})

test('calendar-year ages, YEAR0 2026 vs 2027, sample dob keeps results', () => {
  const dob = sampleDob(40, 2026)
  expect(ageInYear(dob, 2026)).toBe(40)
  expect(ageInYear(dob, 2027)).toBe(41)
  expect(yearAtAge(dob, 50)).toBe(2036)
  expect(ageInYear(sampleDob(40, 2027), 2027)).toBe(40)
  // the sample ages in use (38, 41, 40, 36) keep their age in year0 and pass validation either year
  for (const age of [38, 41, 40, 36]) for (const y0 of [2026, 2027]) {
    expect(ageInYear(sampleDob(age, y0), y0)).toBe(age)
    expect(validateDob(sampleDob(age, y0), now)).toBeNull()
  }
})

test('goal label', () => {
  const dob = { y: 1986, m: 6, d: 15 }
  expect(goalLabel(dob, 36, 2026)).toEqual({ text: 'Date has passed', passed: true })
  expect(goalLabel(dob, 40, 2026)).toEqual({ text: 'this year · age 40 · 2026', passed: false })
  expect(goalLabel(dob, 41, 2026).text).toBe('in 1 yr · age 41 · 2027')
  // year0 2027 makes the age-40 goal (2026) passed
  expect(goalLabel(dob, 40, 2027)).toEqual({ text: 'Date has passed', passed: true })
  expect(goalLabel(dob, 41, 2027).text).toBe('this year · age 41 · 2027')
})

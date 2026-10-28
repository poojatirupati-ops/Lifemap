// The words at the top of Home: time-of-day greeting, today's date and the customer's age.
import { ageOn, isDobComplete, isDobValid } from '../../domain/identity/dob.ts'
import { localToday } from '../../lib/today.ts'
import type { About } from '../../state/types.ts'

export const today = () => localToday((globalThis as { __TODAY?: string }).__TODAY)

export const greeting = (hour = new Date().getHours()) =>
  hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

/** "Wednesday · 28 October" */
export const dateLine = (date = today()) =>
  `${date.toLocaleDateString('en-GB', { weekday: 'long' })} · ${date.getDate()} ${date.toLocaleDateString('en-GB', { month: 'long' })}`

/** Exact age from the date of birth, else the age typed in. */
export function ageToday(about: About, date = today()) {
  const { dob } = about
  return isDobComplete(dob) && isDobValid(dob, date) ? ageOn(dob, date) : about.age
}

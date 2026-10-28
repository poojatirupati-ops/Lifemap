// Booking slots: the next five working days from two days ahead, each with its times.
import { localToday } from '../../lib/today.ts'

const TIMES_BY_DAY = [['10:00', '18:00'], ['13:30'], ['09:00'], ['17:30'], ['12:00']]

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// "Wed 28 Oct" (en-GB locale formatting says "Sept" for the month)
const dayLabel = (date: Date) =>
  `${date.toLocaleDateString('en-GB', { weekday: 'short' })} ${date.getDate()} ${MONTHS[date.getMonth()]}`

export function makeSlots(today = localToday()): string[] {
  const day = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2)
  const slots: string[] = []
  for (const times of TIMES_BY_DAY) {
    while (day.getDay() === 0 || day.getDay() === 6) day.setDate(day.getDate() + 1)
    for (const time of times) slots.push(`${dayLabel(day)} · ${time}`)
    day.setDate(day.getDate() + 1)
  }
  return slots
}

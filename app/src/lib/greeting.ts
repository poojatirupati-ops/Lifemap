import { localToday } from './today.ts'

const WEEKDAY = new Intl.DateTimeFormat('en-GB', { weekday: 'long' })
const DAY_MONTH = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long' })

export const greeting = (hour = new Date().getHours()) =>
  hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

/** "Wednesday · 28 October" */
export const dateLine = (date = localToday()) =>
  `${WEEKDAY.format(date)} · ${DAY_MONTH.format(date)}`

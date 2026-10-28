// Date of birth and calendar-year ages (spec sec 29, 27.1). Pure: no react, storage or network.
export type Dob = { readonly y: number; readonly m: number; readonly d: number }   // m is 1 to 12

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const leap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0
const isReal = ({ y, m, d }: Dob) => Number.isInteger(y) && Number.isInteger(m) && Number.isInteger(d) && y >= 1900 && m >= 1 && m <= 12 && d >= 1 && d <= [31, leap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1]
// Birthday in a given year as month*100+day; 29 Feb falls on 1 March in non-leap years.
const birthdayIn = (dob: Dob, year: number) => (dob.m === 2 && dob.d === 29 && !leap(year) ? 301 : dob.m * 100 + dob.d)
const md = (now: Date) => (now.getMonth() + 1) * 100 + now.getDate()

/** Stored ISO string ('1999-08-21') to Dob; undefined when malformed or not a real date. */
export function parseDob(iso: string): Dob | undefined {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  const dob = m && { y: +m[1], m: +m[2], d: +m[3] }
  return dob && isReal(dob) ? dob : undefined
}

/** Age reached in a calendar year (the rule for plan years, goals, timeline). */
export const ageInYear = (dob: Dob, year: number) => year - dob.y
/** Exact age today. */
export const ageToday = (dob: Dob, now: Date) => now.getFullYear() - dob.y - (birthdayIn(dob, now.getFullYear()) > md(now) ? 1 : 0)
/** Calendar year in which the customer reaches an age. */
export const yearAtAge = (dob: Dob, age: number) => dob.y + age

/** Error text, or null when fine. Partner: pass optional=true so a missing date is allowed. */
export function validateDob(dob: Dob | undefined, now: Date, optional = false): string | null {
  if (!dob) return optional ? null : 'Add your date of birth'
  if (!isReal(dob)) return 'Check the date: that day does not exist'
  const a = ageToday(dob, now)
  if (a < 0) return 'That date is in the future'
  return a < 18 || a > 80 ? 'We can build plans for ages 18 to 80' : null
}

/** 'Thanks, Pooja. You're 27 today and turn 28 on 21 August 2027.' */
export function confirmationLine(name: string | undefined, dob: Dob, now: Date): string {
  const age = ageToday(dob, now)
  const year = now.getFullYear() + (birthdayIn(dob, now.getFullYear()) > md(now) ? 0 : 1)
  const b = birthdayIn(dob, year)
  return `${name ? `Thanks, ${name}.` : 'Thanks.'} You're ${age} today and turn ${age + 1} on ${b % 100} ${MONTHS[Math.floor(b / 100) - 1]} ${year}.`
}

/** Label for a goal at a given age, measured from the plan start year year0 (2026 or 2027): past years read 'Date has passed' (never 'in -4 years') with a Change the date flag. */
export function goalLabel(dob: Dob, goalAge: number, year0: number): { text: string; passed: boolean } {
  const year = yearAtAge(dob, goalAge), n = year - year0
  if (n < 0) return { text: 'Date has passed', passed: true }
  return { text: `${n === 0 ? 'this year' : `in ${n} yr${n > 1 ? 's' : ''}`} · age ${goalAge} · ${year}`, passed: false }
}

/** Sample customers: a date of birth whose age in year0 is the sample's age, so pinned results stay. */
export const sampleDob = (age: number, year0: number): Dob => ({ y: year0 - age, m: 6, d: 15 })

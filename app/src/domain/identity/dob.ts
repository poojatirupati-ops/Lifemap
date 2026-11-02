// Date of birth. The plan age is the age reached in the first plan year (startYear - birth year);
// "age today" is exact from the date. Without a date of birth the typed age stands.
import { differenceInYears } from 'date-fns/differenceInYears'
import { isExists } from 'date-fns/isExists'
import { isLeapYear } from 'date-fns/isLeapYear'
import type { Dob, Plan } from '../../state/types.ts'

type DobInput = Partial<Dob> | null | undefined

const parseDob = (dob: Partial<Dob>) => ({
  year: Number(dob.year),
  month: Number(dob.month),
  day: Number(dob.day),
})

const birthDate = (dob: Partial<Dob>) => {
  const { year, month, day } = parseDob(dob)
  return new Date(year, month - 1, day)
}

// born 29 February: the birthday is 1 March in other years
function birthdayIn(dob: Dob, year: number) {
  const { month, day } = parseDob(dob)
  if (month === 2 && day === 29 && !isLeapYear(new Date(year, 0))) return new Date(year, 2, 1)
  return new Date(year, month - 1, day)
}

export const isDobComplete = (dob: DobInput) => Boolean(dob?.day && dob.month && dob.year)

export function isDobValid(dob: DobInput, today: Date): dob is Dob {
  if (!dob) return false
  const { year, month, day } = parseDob(dob)
  if (String(dob.year).length !== 4 || year < 1900) return false
  return isExists(year, month - 1, day) && birthDate(dob) <= today
}

export const ageOn = (dob: Dob, date: Date) => differenceInYears(date, birthDate(dob))

export function nextBirthday(dob: Dob, today: Date) {
  const thisYear = birthdayIn(dob, today.getFullYear())
  return thisYear > today ? thisYear : birthdayIn(dob, today.getFullYear() + 1)
}

const MAX_AGE = { you: 80, partner: 85 }

// name is the account or partner name; startYear the plan start year
export function checkDob(
  dob: DobInput,
  who: 'you' | 'partner',
  { today, name, startYear }: { today: Date; name?: string; startYear: number },
): { ok: boolean; text: string; ageToday: number | null } {
  if (!isDobComplete(dob)) return { ok: false, text: '', ageToday: null }
  if (!isDobValid(dob, today)) {
    const text = "That doesn't look like a real date. Check the day, month and year."
    return { ok: false, text, ageToday: null }
  }
  const ageToday = ageOn(dob, today)
  if (ageToday < 18) return { ok: false, text: 'LifeMap is for people aged 18 or over.', ageToday }
  const maxAge = MAX_AGE[who]
  if (ageToday > maxAge) {
    const text = `LifeMap plans for people up to age ${maxAge} today. An expert can help beyond that.`
    return { ok: false, text, ageToday }
  }
  const subject = who === 'partner' && name ? `${name} is ` : ''
  const birthday = nextBirthday(dob, today).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const detail =
    who === 'you' && startYear > today.getFullYear()
      ? `your plan starts Jan ${startYear}`
      : `turns ${ageToday + 1} on ${birthday}`
  return { ok: true, ageToday, text: `✓ ${subject}${ageToday} today · ${detail}` }
}

type DatedAgesInput = Pick<Plan['about'], 'age' | 'dob' | 'dobAge' | 'partnerDob'>
type AgeOptions = { startYear: number; today: Date }

/**
 * Ages from the dates of birth: the plan age is startYear - birth year. An age typed since the
 * date of birth set it (_dobAge) wins and drops the date. partnerAge is undefined without a
 * partner date of birth and null with an invalid one.
 */
export function datedAges(about: DatedAgesInput, { startYear, today }: AgeOptions) {
  const typedSinceDob =
    about.dob != null && about.dobAge != null && about.age != null && about.age !== about.dobAge
  const dob = typedSinceDob ? undefined : about.dob
  const own = dob ? checkDob(dob, 'you', { today, startYear }) : null
  const age = own && dob ? (own.ok ? startYear - parseDob(dob).year : null) : about.age
  const pdob = about.partnerDob
  const partner = pdob ? checkDob(pdob, 'partner', { today, startYear }) : null
  return {
    dropDob: typedSinceDob,
    fromDob: own != null,
    age,
    ageToday: own ? (own.ok ? own.ageToday : null) : about.age,
    partnerAge: !pdob ? undefined : partner?.ok ? startYear - parseDob(pdob).year : null,
  }
}

// TODO(R-09): apply datedAges in the identity slice action / normalize, then delete this
export function agesFromDob(
  { about, figures, sources }: Pick<Plan, 'about' | 'figures' | 'sources'>,
  options: AgeOptions,
) {
  const ages = datedAges(about, options)
  if (ages.dropDob) {
    delete about.dob
    delete about.dobAge
  }
  if (ages.fromDob) {
    about.age = ages.age
    about.dobAge = ages.age
    figures.age = ages.age ?? undefined
    if (ages.age != null) sources.age ||= 'pre'
  }
  about.ageToday = ages.ageToday
  if (ages.partnerAge === undefined) return
  if (ages.partnerAge === null) {
    delete figures.pAge
    delete sources.pAge
  } else {
    figures.pAge = ages.partnerAge
    sources.pAge = 'typed'
  }
}

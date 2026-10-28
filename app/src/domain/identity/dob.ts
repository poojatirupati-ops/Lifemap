// Date of birth. The plan age is the age reached in the first plan year (startYear - birth year);
// "age today" is exact from the date. Without a date of birth the typed age stands.
import type { Dob, Plan } from '../../state/types.ts'

type DobInput = Partial<Dob> | null | undefined

const parseDob = (dob: Partial<Dob>) => ({
  year: Number(dob.y),
  month: Number(dob.m),
  day: Number(dob.d),
})

const isLeapYear = (year: number) => new Date(year, 1, 29).getDate() === 29

// born 29 February: the birthday is 1 March in other years
function birthdayIn(dob: Dob, year: number) {
  const { month, day } = parseDob(dob)
  if (month === 2 && day === 29 && !isLeapYear(year)) return new Date(year, 2, 1)
  return new Date(year, month - 1, day)
}

export const isDobComplete = (dob: DobInput) => Boolean(dob?.d && dob.m && dob.y)

export function isDobValid(dob: DobInput, today: Date): dob is Dob {
  if (!dob) return false
  const { year, month, day } = parseDob(dob)
  if (![year, month, day].every(Number.isInteger)) return false
  if (String(dob.y).length !== 4 || year < 1900) return false
  if (month < 1 || month > 12 || day < 1 || day > 31) return false
  const date = new Date(year, month - 1, day)
  const exists = date.getMonth() === month - 1 && date.getDate() === day
  return exists && date <= today
}

export function ageOn(dob: Dob, date: Date) {
  const hadBirthday = date >= birthdayIn(dob, date.getFullYear())
  return date.getFullYear() - parseDob(dob).year - (hadBirthday ? 0 : 1)
}

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

type DatedAgesInput = Pick<Plan['about'], 'age' | 'dob' | '_dobAge' | 'pdob'>

/**
 * Ages from the dates of birth: the plan age is startYear - birth year. An age typed since the
 * date of birth set it (_dobAge) wins and drops the date. partnerAge is undefined without a
 * partner date of birth and null when that date is not valid.
 */
export function datedAges(about: DatedAgesInput, { startYear, today }: AgeOptions) {
  const typedSinceDob =
    about.dob != null && about._dobAge != null && about.age != null && about.age !== about._dobAge
  const dob = typedSinceDob ? undefined : about.dob
  const own = dob ? checkDob(dob, 'you', { today, startYear }) : null
  const age = own ? (own.ok ? startYear - parseDob(dob!).year : null) : about.age
  const partner = about.pdob ? checkDob(about.pdob, 'partner', { today, startYear }) : null
  return {
    dropDob: typedSinceDob,
    fromDob: own != null,
    age,
    ageToday: own ? (own.ok ? own.ageToday : null) : about.age,
    partnerAge: partner && (partner.ok ? startYear - parseDob(about.pdob!).year : null),
  }
}

type AgeOptions = { startYear: number; today: Date }

// TODO(R-09): apply datedAges in the identity slice action / normalize, then delete this
export function agesFromDob(
  { about, fin, src }: Pick<Plan, 'about' | 'fin' | 'src'>,
  options: AgeOptions,
) {
  const ages = datedAges(about, options)
  if (ages.dropDob) {
    delete about.dob
    delete about._dobAge
  }
  if (ages.fromDob) {
    about.age = ages.age
    about._dobAge = ages.age
    fin.age = ages.age ?? undefined
    if (ages.age != null) src.age ||= 'pre'
  }
  about.ageToday = ages.ageToday
  if (ages.partnerAge === undefined) return
  if (ages.partnerAge === null) {
    delete fin.pAge
    delete src.pAge
  } else {
    fin.pAge = ages.partnerAge
    src.pAge = 'typed'
  }
}

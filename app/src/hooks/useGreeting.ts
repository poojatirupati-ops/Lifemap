import { ageOn, isDobComplete, isDobValid } from '../domain/identity/dob.ts'
import { localToday } from '../lib/today.ts'
import { useStore } from '../state/store.ts'

/** The customer's name and age for Home's greeting: exact age from the date of birth, else the age typed in. */
export function useGreeting() {
  const name = useStore((store) => store.plan.account.name)
  const dob = useStore((store) => store.plan.about.dob)
  const typedAge = useStore((store) => store.plan.about.age)
  const today = localToday()
  const age = isDobComplete(dob) && isDobValid(dob, today) ? ageOn(dob, today) : typedAge
  return { name, age }
}

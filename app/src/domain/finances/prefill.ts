interface KnownDetails {
  name: string
  age: number | null
  retireAge: number
  retireSet: boolean
}

type KnownFinances = Partial<{ name: string; age: number; retireAge: number }>

/** After sign-in, Your finances starts from what the customer already told us: the fields to fill in. */
export function prefillFinances({ name, age, retireAge, retireSet }: KnownDetails) {
  const known: KnownFinances = {}
  if (name) known.name = name
  if (age !== null && age >= 18) known.age = age
  if (retireSet) known.retireAge = retireAge
  return known
}

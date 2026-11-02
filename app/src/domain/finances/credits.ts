import { rulesFor } from '../planning/rates.ts'
import { euro } from '../../lib/format.ts'

export type Household = {
  startYear: number
  home?: string
  deps: number | null
  partner: boolean | null
  married?: boolean | null
}

/** The tax credits that need a Yes from the customer, each only when it can apply. */
export function creditsFor({ startYear, home, deps, partner, married }: Household) {
  const it = rulesFor(startYear).it
  return [
    {
      key: 'rent',
      label: 'I pay rent on my home (not to a relative)',
      detail: `Rent Tax Credit, up to ${euro(it.rent)} a year (${euro(it.rentJoint)} for a married couple), to ${it.rentLastYear}`,
      applies: home !== 'Own outright' && home !== 'Own with mortgage',
    },
    {
      key: 'lone',
      label: "I'm the main carer of a child, with no partner",
      detail: `Single Person Child Carer Credit ${euro(it.spccc)} and a ${euro(it.bandSPCCC)} standard-rate band`,
      applies: (deps ?? 0) > 0 && !partner,
    },
    {
      key: 'carer',
      label: 'One of us stays at home to care for a child or dependant',
      detail: `Home Carer Tax Credit up to ${euro(it.homeCarer)} (married couples)`,
      applies: !!partner && married === true,
    },
  ].filter((credit) => credit.applies)
}

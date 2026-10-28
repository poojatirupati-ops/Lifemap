import { useShallow } from 'zustand/react/shallow'
import { assumption } from '../../domain/planning/assumptions.ts'
import { rulesFor } from '../../domain/planning/rates.ts'
import { euro } from '../../lib/format.ts'
import { useStore } from '../../state/store.ts'
import type { Plan } from '../../state/types.ts'

// TODO(R-19): about.cred belongs in types.ts
type Credits = Record<string, boolean>
type CreditPlan = Plan & { about: Plan['about'] & { cred?: Credits } }

/** The tax credits that need a Yes from the customer, each only when it can apply. */
type Household = {
  startYear: number
  home?: string
  deps: number | null
  partner: boolean | null
  married?: boolean | null
}

function creditsFor({ startYear, home, deps, partner, married }: Household) {
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

const toggleCredit = (key: string) =>
  useStore.getState().update((plan: CreditPlan) => {
    plan.about.cred = { ...plan.about.cred, [key]: !plan.about.cred?.[key] }
  })

export default function CredChips() {
  const household = useStore(
    useShallow(({ plan }): Household => ({
      startYear: assumption(plan, 'startYear'),
      home: plan.fin.home,
      deps: plan.about.deps,
      partner: plan.about.partner,
      married: plan.about.married,
    })),
  )
  const credits = creditsFor(household)
  const chosen = useStore(({ plan }) => (plan as CreditPlan).about.cred)
  if (!credits.length) return null
  return (
    <div
      className="field"
      style={{ margin: '14px 0 0', borderTop: '1px dashed var(--line)', paddingTop: 12 }}
    >
      <span className="flabel" id="cred-l">
        Do any of these apply to you?{' '}
        <span className="small" style={{ fontWeight: 600 }}>
          Optional
        </span>
      </span>
      <div className="chips" role="group" aria-labelledby="cred-l">
        {credits.map(({ key, label }) => (
          <button
            key={key}
            className={chosen?.[key] ? 'chip sm sel' : 'chip sm'}
            aria-pressed={!!chosen?.[key]}
            data-a="cred"
            data-p={key}
            onClick={() => toggleCredit(key)}
          >
            {label}
          </button>
        ))}
      </div>
      <span className="small">{credits.map(({ detail }) => detail).join(' · ')}.</span>
    </div>
  )
}

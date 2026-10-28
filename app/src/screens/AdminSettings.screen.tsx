import { meHead } from '../components/me/meHead.ts'
import GuidanceFigures from '../components/admin/GuidanceFigures.tsx'
import PartnerCard from '../components/admin/PartnerCard.tsx'
import StandardField from '../components/admin/StandardField.tsx'
import StandardGroup from '../components/admin/StandardGroup.tsx'
import { STANDARDS, type StandardKey } from '../domain/planning/settings.data.ts'
import { useStore } from '../state/store.ts'

export const key = 'SET'
export const id = 'ADMIN-SET'
export const note =
  'ADMIN VIEW (journey-spec §19.6, option C): the Settings block, controlled by LifeMap or a partner. Not shown to customers.'

const closeAdmin = () =>
  useStore.getState().update((plan) => {
    plan.admin = false
  })

export const Head = () =>
  meHead({ title: 'Settings', sub: '🔒 Admin view · not for customers', back: closeAdmin })

/** Standard keys by group, in the order they are listed. */
const GROUPS = new Map<string, StandardKey[]>()
for (const standardKey of Object.keys(STANDARDS) as StandardKey[]) {
  const group = STANDARDS[standardKey].group ?? ''
  GROUPS.set(group, [...(GROUPS.get(group) ?? []), standardKey])
}

export function Body() {
  return (
    <>
      <div
        className="note"
        role="note"
        style={{ background: '#FFF3CD', border: '1.5px solid #E0B84A' }}
      >
        <b>🔒 Admin view · not for customers.</b> LifeMap or a partner (credit union, adviser firm,
        company, agent) controls these standards. A figure changed here changes the suggestion
        everywhere, in the app and in the workbook's Settings sheet. Customers can still change any
        of them for their own plan. Law values (tax, USC, PRSI, pension relief, State Pension,
        Central Bank limits) are not here and can't be changed. Retirement age and life expectancy
        have no standard.
      </div>
      <PartnerCard />
      {[...GROUPS].map(([group, keys]) => (
        <StandardGroup key={group} name={`set-${group}`} title={`${group} (${keys.length})`}>
          {keys.map((standardKey) => (
            <StandardField key={standardKey} id={standardKey} />
          ))}
        </StandardGroup>
      ))}
      <GuidanceFigures />
    </>
  )
}

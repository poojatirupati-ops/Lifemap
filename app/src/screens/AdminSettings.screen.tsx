import { meHead } from '../components/me/meHead.ts'
import AdminNote from '../components/admin/AdminNote.tsx'
import GuidanceFigures from '../components/admin/GuidanceFigures.tsx'
import PartnerCard from '../components/admin/PartnerCard.tsx'
import StandardField from '../components/admin/StandardField.tsx'
import StandardGroup from '../components/admin/StandardGroup.tsx'
import { STANDARD_GROUPS } from '../domain/planning/settings.data.ts'
import { useStore } from '../state/store.ts'

export const key = 'SET'
export const id = 'ADMIN-SET'
export const note =
  'ADMIN VIEW (journey-spec §19.6, option C): the Settings block, controlled by LifeMap or a partner. Not shown to customers.'

const closeAdmin = () =>
  useStore.getState().update((_, ui) => {
    ui.adminView = false
  })

export const Head = () =>
  meHead({ title: 'Settings', sub: '🔒 Admin view · not for customers', back: closeAdmin })

export function Body() {
  return (
    <>
      <AdminNote />
      <PartnerCard />
      {Object.entries(STANDARD_GROUPS).map(([group, keys = []]) => (
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

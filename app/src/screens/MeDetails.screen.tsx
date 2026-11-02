import { useShallow } from 'zustand/react/shallow'
import { meHead } from '../components/me/meHead.ts'
import { backToMe } from '../components/finance/financeActions.ts'
import Avatar from '../components/me/Avatar.tsx'
import DetailRow from '../components/me/DetailRow.tsx'
import { isDobValid } from '../domain/identity/dob.ts'
import { localToday } from '../lib/today.ts'
import { DEPENDANT_CHOICES } from '../domain/identity/household.data.ts'
import { useStore } from '../state/store.ts'
import type { Plan } from '../state/types.ts'

export const key = 'ME:details'
export const id = 'ME-DET'
export const note =
  'My details as a profile page: photo header, personal and household groups; empty fields show Add.'

export const Head = () => meHead({ title: '', back: backToMe })

const longDate = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

function birthDate({ about }: Pick<Plan, 'about'>) {
  if (!isDobValid(about.dob, localToday())) return ''
  const { day: d, month: m, year: y } = about.dob
  return longDate.format(new Date(Number(y), Number(m) - 1, Number(d)))
}

function ageText({ about }: Pick<Plan, 'about'>) {
  const age = about.ageToday || about.age
  return age ? `${age}${about.ageToday ? ' today' : ''}` : ''
}

function partnerText({ about, partner, figures: fin }: Pick<Plan, 'about' | 'partner' | 'figures'>) {
  if (!about.partner) return 'No'
  if (partner.mode === 'invite')
    return partner.sent ? `Invite saved · ${partner.email}` : 'Invite not sent yet'
  if (partner.mode === 'manual')
    return [partner.name || 'Added by you', fin.pAge ? `age ${fin.pAge}` : '']
      .filter(Boolean)
      .join(', ')
  return 'Yes'
}

export function Body() {
  const view = useStore(
    useShallow(({ plan }) => ({
      name: plan.account.name || plan.figures.name || '',
      email: plan.account.email,
      mobile: plan.account.mobile,
      birthDate: birthDate(plan),
      age: ageText(plan),
      partner: partnerText(plan),
      dependants: DEPENDANT_CHOICES[plan.about.dependants || 0],
      retireAge: plan.retireSet ? String(plan.retireAge) : '',
    })),
  )

  return (
    <>
      <div className="card mepro pdpro">
        <div className="mp-cover" aria-hidden="true"></div>
        <Avatar />
        <h2 className="mp-name t" tabIndex={-1}>
          {view.name || 'Your profile'}
        </h2>
        <p className="mp-sub">{view.email || 'Add your details so your plan fits you'}</p>
        <button
          className="mp-edit"
          data-a="fsec"
          data-p="0"
          onClick={() => useStore.getState().openSection(0)}
        >
          Edit profile
        </button>
      </div>
      <h3 className="me-gh">Personal</h3>
      <div className="pd-list">
        <DetailRow emoji="👤" label="Name" value={view.name} />
        <DetailRow emoji="✉️" label="Email" value={view.email} />
        <DetailRow emoji="📱" label="Mobile" value={view.mobile} />
        <DetailRow emoji="🎂" label="Date of birth" value={view.birthDate} />
        <DetailRow emoji="⏳" label="Age" value={view.age} />
      </div>
      <h3 className="me-gh">Household & plan</h3>
      <div className="pd-list">
        <DetailRow emoji="💞" label="Partner" value={view.partner} />
        <DetailRow emoji="👨‍👩‍👧" label="People who rely on you" value={view.dependants} />
        <DetailRow emoji="🌅" label="Retirement age" value={view.retireAge} />
      </div>
    </>
  )
}

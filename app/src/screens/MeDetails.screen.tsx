import { meHead } from '../components/me/meHead.ts'
import { backToMe, openSection } from '../components/finance/financeActions.ts'
import Avatar from '../components/me/Avatar.tsx'
import DetailRow from '../components/me/DetailRow.tsx'
import { useMePlan, type MePlan } from '../components/me/mePlan.ts'
import { isDobValid } from '../domain/identity/dob.ts'
import { localToday } from '../lib/today.ts'

export const key = 'ME:details'
export const id = 'ME-DET'
export const note =
  'My details as a profile page: photo header, personal and household groups; empty fields show Add.'

export const Head = () => meHead({ title: '', back: backToMe })

const DEPENDANTS = ['0', '1', '2', '3+']
const longDate = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

function birthDate({ about }: MePlan) {
  const today = localToday((globalThis as { __TODAY?: string }).__TODAY)
  if (!isDobValid(about.dob, today)) return ''
  const { d, m, y } = about.dob
  return longDate.format(new Date(Number(y), Number(m) - 1, Number(d)))
}

function ageText({ about }: MePlan) {
  const age = about.ageToday || about.age
  return age ? `${age}${about.ageToday ? ' today' : ''}` : ''
}

function partnerText({ about, partner, fin }: MePlan) {
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
  const plan = useMePlan((plan) => plan)
  const name = plan.acct.name || plan.fin.name || ''

  return (
    <>
      <div className="card mepro pdpro">
        <div className="mp-cover" aria-hidden="true"></div>
        <Avatar />
        <h2 className="mp-name t" tabIndex={-1}>
          {name || 'Your profile'}
        </h2>
        <p className="mp-sub">{plan.acct.email || 'Add your details so your plan fits you'}</p>
        <button className="mp-edit" data-a="fsec" data-p="0" onClick={() => openSection(0)}>
          Edit profile
        </button>
      </div>
      <h3 className="me-gh">Personal</h3>
      <div className="pd-list">
        <DetailRow emoji="👤" label="Name" value={name} />
        <DetailRow emoji="✉️" label="Email" value={plan.acct.email} />
        <DetailRow emoji="📱" label="Mobile" value={plan.acct.mobile} />
        <DetailRow emoji="🎂" label="Date of birth" value={birthDate(plan)} />
        <DetailRow emoji="⏳" label="Age" value={ageText(plan)} />
      </div>
      <h3 className="me-gh">Household & plan</h3>
      <div className="pd-list">
        <DetailRow emoji="💞" label="Partner" value={partnerText(plan)} />
        <DetailRow
          emoji="👨‍👩‍👧"
          label="People who rely on you"
          value={DEPENDANTS[plan.about.deps || 0]}
        />
        <DetailRow
          emoji="🌅"
          label="Retirement age"
          value={plan.retireSet ? String(plan.retireAge) : ''}
        />
      </div>
    </>
  )
}

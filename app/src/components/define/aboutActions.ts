// What About you & your family (B1) does. The store's normalize turns dates of birth into ages.
// TODO(Q-01): move into an identity slice in src/state once the store has per-context slices.
import type { Dob, Plan } from '../../state/types.ts'
import { rerender, toast } from '../../state/shell.ts'
import { useStore } from '../../state/store.ts'
import { looksLikeEmail } from '../account/accountDetails.ts'

const update = (recipe: (plan: Plan) => void) => useStore.getState().update(recipe)

export type Who = 'you' | 'partner'
const dobKey = (who: Who) => (who === 'you' ? 'dob' : 'pdob')

export const setFirstName = (name: string) =>
  update((plan) => {
    plan.acct.name = name
  })

export const setDobPart = (who: Who, part: keyof Dob, digits: string) =>
  update(({ about }) => {
    // ponytail: a date being typed has some parts missing; Dob types them all
    about[dobKey(who)] = { ...about[dobKey(who)], [part]: digits } as Dob
  })

export const setPlanningWithPartner = (together: boolean) =>
  update(({ about }) => {
    about.partner = together
  })

/** Tapping the chosen answer again clears it: the question is optional. */
export const toggleMarried = (married: boolean) =>
  update(({ about }) => {
    about.married = about.married === married ? null : married
  })

export const setDependants = (count: number) =>
  update(({ about }) => {
    about.deps = count
  })

export const setPartnerMode = (mode: 'invite' | 'manual') =>
  update(({ partner }) => {
    partner.mode = mode
  })

export const setPartnerDetail = (field: 'email' | 'name', value: string) =>
  update(({ partner }) => {
    partner[field] = value.slice(0, 60)
  })

// ponytail: no document precedence here; R-19's finance field owns that once pIncome moves there
export const setPartnerIncome = (text: string) =>
  update(({ fin, src }) => {
    const amount = parseInt(text.replace(/\D/g, ''))
    fin.pIncome = Number.isNaN(amount) ? null : amount
    src.pIncome = 'typed'
  })

/** Returns an error to show, or null once the invite is sent. */
export function sendPartnerInvite(email: string) {
  const address = email.trim()
  if (!looksLikeEmail(address)) return 'Please enter a valid email.'
  update(({ partner }) => {
    partner.email = address
    partner.sent = true
  })
  toast(`Invite saved for ${address}. Sending isn't live yet`)
  return null
}

export const resendPartnerInvite = () =>
  toast(`Invites aren't sent yet. Saved for ${useStore.getState().plan.partner.email}`)

export function cancelPartnerInvite() {
  update(({ partner }) => {
    partner.sent = false
  })
  toast('Invite cancelled')
}

// TODO(R-05): FlowHead has the same; export one of them
export function leavePlanBuilder() {
  useStore.getState().leavePlanBuilder()
  rerender()
  toast('Saved. Carry on any time from My Plan')
}

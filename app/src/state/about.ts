// What About you & your family (B1) does. The store's normalize turns dates of birth into ages.
import type { Dob } from './types.ts'
import { toast } from './shell.ts'
import { useStore } from './store.ts'
import { looksLikeEmail } from '../domain/identity/signIn.ts'
import { parseWholeEuros } from '../lib/format.ts'

export type Who = 'you' | 'partner'
export const dobKey = (who: Who) => (who === 'you' ? 'dob' : 'partnerDob')

export const setFirstName = (name: string) =>
  useStore.getState().update((plan) => {
    plan.account.name = name
  })

export const setDobPart = (who: Who, part: keyof Dob, digits: string) =>
  useStore.getState().update(({ about }) => {
    about[dobKey(who)] = { ...about[dobKey(who)], [part]: digits }
  })

export const setPlanningWithPartner = (together: boolean) =>
  useStore.getState().update(({ about }) => {
    about.partner = together
  })

/** Tapping the chosen answer again clears it: the question is optional. */
export const toggleMarried = (married: boolean) =>
  useStore.getState().update(({ about }) => {
    about.married = about.married === married ? null : married
  })

export const setDependants = (count: number) =>
  useStore.getState().update(({ about }) => {
    about.dependants = count
  })

export const setPartnerMode = (mode: 'invite' | 'manual') =>
  useStore.getState().update(({ partner }) => {
    partner.mode = mode
  })

export const setPartnerDetail = (field: 'email' | 'name', value: string) =>
  useStore.getState().update(({ partner }) => {
    partner[field] = value.slice(0, 60)
  })

/** The partner's income is only ever typed here, so no statement figure competes with it. */
export const setPartnerIncome = (text: string) =>
  useStore.getState().update(({ figures, sources }) => {
    figures.pIncome = parseWholeEuros(text)
    sources.pIncome = 'typed'
  })

/** Returns an error to show, or null once the invite is sent. */
export function sendPartnerInvite(email: string) {
  const address = email.trim()
  if (!looksLikeEmail(address)) return 'Please enter a valid email.'
  useStore.getState().update(({ partner }) => {
    partner.email = address
    partner.sent = true
  })
  toast(`Invite saved for ${address}. Sending isn't live yet`)
  return null
}

export const resendPartnerInvite = () =>
  toast(`Invites aren't sent yet. Saved for ${useStore.getState().plan.partner.email}`)

export function cancelPartnerInvite() {
  useStore.getState().update(({ partner }) => {
    partner.sent = false
  })
  toast('Invite cancelled')
}

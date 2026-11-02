import type { Plan } from '../../state/types.ts'

type Contact = Pick<Plan['account'], 'name' | 'email' | 'mobile' | 'termsAccepted'>

export const CODE_LENGTH = 6

export const looksLikeEmail = (email: string) => /.+@.+\..+/.test(email)

const looksLikeMobile = (mobile: string) => mobile.replace(/\D/g, '').length >= 9

/** P1's "Send my email code" needs a name, an email, a mobile and the required consent. */
export const canSendCode = ({ name, email, mobile, termsAccepted: c1 }: Contact) =>
  name.trim() !== '' && looksLikeEmail(email) && looksLikeMobile(mobile) && c1

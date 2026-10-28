import type { Plan } from '../../state/types.ts'

type Account = Plan['acct']

export const looksLikeEmail = (email: string) => /.+@.+\..+/.test(email)

const looksLikeMobile = (mobile: string) => mobile.replace(/\D/g, '').length >= 9

/** P1's "Send my email code" needs a name, an email, a mobile and the required consent. */
export const canSendCode = ({ name, email, mobile, c1 }: Account) =>
  !!name.trim() && looksLikeEmail(email) && looksLikeMobile(mobile) && c1

/** After sign-in, Your finances starts from what the customer already told us. */
export function prefillFinances(plan: Plan) {
  if (plan.acct.name) {
    plan.fin.name = plan.acct.name
    plan.src.name ||= 'pre'
  }
  if ((plan.about.age ?? 0) >= 18) {
    plan.fin.age = plan.about.age
    plan.src.age ||= 'pre'
  }
  if (plan.retireSet) {
    plan.fin.retireAge = plan.retireAge
    plan.src.retireAge ||= 'pre'
  }
}

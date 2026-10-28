import { meHead } from '../components/me/meHead.ts'
import { useProfileAnswers } from '../components/discover/useProfileAnswers.ts'
import { backToMe } from '../components/finance/financeActions.ts'
import TermsList from '../components/me/TermsList.tsx'
import { moneyTerms } from '../domain/discovery/moneyTerms.ts'
import { DISCOVERY_DISCLAIMER } from '../domain/identity/personality.data.ts'

export const key = 'ME:terms'
export const id = 'ME-TERMS'
export const note =
  'Your money terms: the Lifecast financial / behavioural terms from your answers, each with a plain-English meaning (§12).'

export const Head = () =>
  meHead({
    title: 'Your money terms',
    sub: 'The words an adviser would use, and what they mean for you.',
    back: backToMe,
  })

export function Body() {
  const hasTerms = moneyTerms(useProfileAnswers()).length > 0
  return (
    <>
      <div className="card">
        {hasTerms ? (
          <TermsList />
        ) : (
          <p className="small">Answer your first questions to see your terms.</p>
        )}
      </div>
      <p className="disc">
        These describe how you answered. They are not advice. {DISCOVERY_DISCLAIMER}
      </p>
    </>
  )
}

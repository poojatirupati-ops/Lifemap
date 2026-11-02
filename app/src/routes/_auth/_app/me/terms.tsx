import { createFileRoute } from '@tanstack/react-router'
import AppScreen from '../../../../components/frame/AppScreen.tsx'
import { useProfileAnswers } from '../../../../hooks/useProfileAnswers.ts'
import { backToMe } from '../../../../state/finances.ts'
import TermsList from '../../../../components/me/TermsList.tsx'
import { moneyTerms } from '../../../../domain/discovery/moneyTerms.ts'
import { DISCOVERY_DISCLAIMER } from '../../../../domain/identity/personality.data.ts'

export const Route = createFileRoute('/_auth/_app/me/terms')({ component: MeTerms })

function MeTerms() {
  const terms = moneyTerms(useProfileAnswers())
  return (
    <AppScreen
      id="ME-TERMS"
      note={
        'Your money terms: the Lifecast financial / behavioural terms from your answers, each with a plain-English meaning (§12).'
      }
      title="Your money terms"
      sub="The words an adviser would use, and what they mean for you."
      back={backToMe}
      bell
    >
      <div className="card">
        {terms.length ? (
          <TermsList terms={terms} />
        ) : (
          <p className="small">Answer your first questions to see your terms.</p>
        )}
      </div>
      <p className="disc">
        These describe how you answered. They are not advice. {DISCOVERY_DISCLAIMER}
      </p>
    </AppScreen>
  )
}

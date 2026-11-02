import { createFileRoute } from '@tanstack/react-router'
import AppScreen from '../../../../components/frame/AppScreen.tsx'
import PrefilledAnswers from '../../../../components/define/PrefilledAnswers.tsx'
import ProfileQuestionCard from '../../../../components/define/ProfileQuestionCard.tsx'
import { profileQuestion } from '../../../../domain/discovery/profileQuestions.ts'
import { backToMe } from '../../../../state/finances.ts'
import { confirmFirstAnswers } from '../../../../state/profile.ts'
import { DISCOVER_SIX } from '../../../../domain/discovery/questions.data.ts'
import { useStore } from '../../../../state/store.ts'

const FIRST_ANSWERS = DISCOVER_SIX.map((question) => profileQuestion(question.id))

export const Route = createFileRoute('/_auth/_app/me/recheck')({ component: MeRecheck })

function MeRecheck() {
  const answers = useStore((store) => store.plan.answers)
  return (
    <AppScreen
      id="ME-CHK"
      note={'Re-check of the 6 Discover answers, pre-filled. Confirm or change (Pooja Q5).'}
      title="Your first answers"
      sub="From when you started. Do they still fit you?"
      back={backToMe}
      bell
      foot={
        <button className="btn" data-a="recheckok" onClick={confirmFirstAnswers}>
          These still look right
        </button>
      }
    >
      <PrefilledAnswers entries={FIRST_ANSWERS} />
      {FIRST_ANSWERS.filter(({ question }) => answers[question.id] == null).map((entry) => (
        <ProfileQuestionCard key={entry.question.id} entry={entry} label="Not answered yet" />
      ))}
    </AppScreen>
  )
}

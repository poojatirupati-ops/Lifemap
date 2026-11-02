import { meHead } from '../components/me/meHead.ts'
import PrefilledAnswers from '../components/define/PrefilledAnswers.tsx'
import ProfileQuestionCard from '../components/define/ProfileQuestionCard.tsx'
import { profileQuestion } from '../domain/discovery/profileQuestions.ts'
import { backToMe } from '../components/finance/financeActions.ts'
import { confirmFirstAnswers } from '../components/me/meActions.ts'
import { DISCOVER_SIX } from '../domain/discovery/questions.data.ts'
import { useStore } from '../state/store.ts'

export const key = 'ME:recheck'
export const id = 'ME-CHK'
export const note = 'Re-check of the 6 Discover answers, pre-filled. Confirm or change (Pooja Q5).'

export const Head = () =>
  meHead({
    title: 'Your first answers',
    sub: 'From when you started. Do they still fit you?',
    back: backToMe,
  })

const FIRST_ANSWERS = DISCOVER_SIX.map((question) => profileQuestion(question.id))

export function Body() {
  const answers = useStore((store) => store.plan.answers)
  return (
    <>
      <PrefilledAnswers entries={FIRST_ANSWERS} />
      {FIRST_ANSWERS.filter(({ question }) => answers[question.id] == null).map((entry) => (
        <ProfileQuestionCard key={entry.question.id} entry={entry} label="Not answered yet" />
      ))}
    </>
  )
}

export const Foot = () => (
  <button className="btn" data-a="recheckok" onClick={confirmFirstAnswers}>
    These still look right
  </button>
)

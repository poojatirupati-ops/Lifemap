import { meHead } from '../components/me/meHead.ts'
import Emo from '../components/ui/Emo.tsx'
import PrefilledAnswers from '../components/define/PrefilledAnswers.tsx'
import ProfileQuestionCard from '../components/define/ProfileQuestionCard.tsx'
import { profileQuestion } from '../components/define/profileActions.ts'
import { saveProfileSection } from '../components/me/meActions.ts'
import { openMe } from '../components/plan/planActions.ts'
import { MONEY_PROFILE } from '../domain/discovery/questions.data.ts'
import { useStore } from '../state/store.ts'
import type { Plan } from '../state/types.ts'

export const key = 'ME:ums'

const sectionOf = (plan: Plan) => MONEY_PROFILE.find(({ step }) => step === plan.um.sec)!

/** How many questions come before this section, for "4 of 13". */
const questionsBefore = (step: number) =>
  MONEY_PROFILE.filter((section) => section.step < step).reduce(
    (count, section) => count + section.questions.length,
    0,
  )

export const id = (plan: Plan) => `ME-UM${sectionOf(plan).step}`
export const note = (plan: Plan) => {
  const { step, title } = sectionOf(plan)
  return `Understand Me section ${step} · ${title}. Pre-filled answers shown selected, with Change.`
}

export function Head() {
  const { emoji, term, plain } = sectionOf(useStore.getState().plan)
  return meHead({
    title: <Emo>{`${emoji} ${term}`}</Emo>,
    sub: `${plain.charAt(0).toUpperCase()}${plain.slice(1)}.`,
    back: () => openMe('um'),
  })
}

export function Body() {
  const section = useStore(({ plan }) => sectionOf(plan))
  const answers = useStore((store) => store.plan.ans)
  const entries = section.questions.map(profileQuestion)
  const before = questionsBefore(section.step)

  return (
    <>
      <PrefilledAnswers entries={entries} />
      {entries.map((entry, index) =>
        entry.discover && answers[entry.question.id] != null ? null : (
          <ProfileQuestionCard
            key={entry.question.id}
            entry={entry}
            label={`${before + index + 1} of 13`}
          />
        ),
      )}
    </>
  )
}

export const Foot = () => (
  <button className="btn" data-a="umsave" onClick={saveProfileSection}>
    Save this section
  </button>
)

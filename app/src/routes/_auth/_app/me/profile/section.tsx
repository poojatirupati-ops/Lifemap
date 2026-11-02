import { createFileRoute } from '@tanstack/react-router'
import AppScreen from '../../../../../components/frame/AppScreen.tsx'
import Emo from '../../../../../components/ui/Emo.tsx'
import PrefilledAnswers from '../../../../../components/define/PrefilledAnswers.tsx'
import ProfileQuestionCard from '../../../../../components/define/ProfileQuestionCard.tsx'
import { PROFILE_QUESTIONS } from '../../../../../domain/discovery/profileQuestions.ts'
import { profileQuestion } from '../../../../../domain/discovery/profileQuestions.ts'
import { saveProfileSection, sectionOf } from '../../../../../state/profile.ts'
import { MONEY_PROFILE } from '../../../../../domain/discovery/questions.data.ts'
import { useStore } from '../../../../../state/store.ts'

/** How many questions come before this section, for "4 of 13". */
const questionsBefore = (step: number) =>
  MONEY_PROFILE.filter((section) => section.step < step).flatMap((section) => section.questions)
    .length

export const Route = createFileRoute('/_auth/_app/me/profile/section')({
  component: MeProfileSection,
})

function MeProfileSection() {
  const section = useStore(({ plan }) => sectionOf(plan))
  const answers = useStore((store) => store.plan.answers)
  const entries = section.questions.map(profileQuestion)
  const before = questionsBefore(section.step)
  const { step, title, emoji, term, plain } = useStore(({ plan }) => sectionOf(plan))
  const { openMe } = useStore.getState()
  return (
    <AppScreen
      id={`ME-UM${step}`}
      note={`Understand Me section ${step} · ${title}. Pre-filled answers shown selected, with Change.`}
      title={<Emo>{`${emoji} ${term}`}</Emo>}
      sub={`${plain.charAt(0).toUpperCase()}${plain.slice(1)}.`}
      back={() => openMe('um')}
      bell
      foot={
        <button className="btn" data-a="umsave" onClick={saveProfileSection}>
          Save this section
        </button>
      }
    >
      <PrefilledAnswers entries={entries} />
      {entries.map((entry, index) =>
        entry.discover && answers[entry.question.id] != null ? null : (
          <ProfileQuestionCard
            key={entry.question.id}
            entry={entry}
            label={`${before + index + 1} of ${PROFILE_QUESTIONS}`}
          />
        ),
      )}
    </AppScreen>
  )
}

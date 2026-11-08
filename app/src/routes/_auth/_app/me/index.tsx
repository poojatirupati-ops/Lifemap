import { createFileRoute } from '@tanstack/react-router'
import AppScreen from '../../../../components/frame/AppScreen.tsx'
import { useShallow } from 'zustand/react/shallow'
import { useStore } from '../../../../state/store.ts'
import HouseholdCard from '../../../../components/me/HouseholdCard.tsx'
import MeRow from '../../../../components/me/MeRow.tsx'
import PersonalityCard from '../../../../components/me/PersonalityCard.tsx'
import ProfileCard from '../../../../components/me/ProfileCard.tsx'
import SignOutRow from '../../../../components/me/SignOutRow.tsx'
import { useIsAdviser } from '../../../../bookings/bookings.ts'
import { makePlan } from '../../../../state/plan.ts'
import { toProfile } from '../../../../state/profile.ts'
import { needsProfile } from '../../../../domain/identity/booking.ts'
import {
  deeperAnswered,
  discoverAnswered,
  profilePercent,
} from '../../../../domain/discovery/profileQuestions.ts'
import { NEW_QUESTIONS } from '../../../../domain/discovery/profileQuestions.ts'

const SETTINGS = [
  { emoji: '🧮', title: 'Your assumptions', detail: 'Prices, growth and retirement', page: 'asm' },
  {
    emoji: '🔐',
    title: 'Privacy & preferences',
    detail: 'Consents and your data',
    page: 'privacy',
  },
]

export const Route = createFileRoute('/_auth/_app/me/')({ component: MeHub })

function MeHub() {
  const view = useStore(
    useShallow(({ plan }) => ({
      inApp: plan.hasResults,
      checkProfile: plan.booking.done && needsProfile(plan),
      rechecked: plan.moneyProfile.rechecked,
      firstAnswers: discoverAnswered(plan.answers),
      deeperAnswered: deeperAnswered(plan),
      percent: profilePercent(plan),
    })),
  )
  const adviser = useIsAdviser()
  return (
    <AppScreen
      id="ME-01"
      note={
        'Me = profile hub: name, partner (invite or add myself), dependants · money personality + indicative risk profile · re-check of first answers · deeper questions (feed My Plan). Not a gate.'
      }
      title="Me"
      bell
    >
      {view.checkProfile && (
        <div className="nudge">
          <span aria-hidden="true">🧭</span>
          <span>Check your profile before your adviser meeting</span>
          <button className="link" data-a="toprofile" onClick={toProfile}>
            Check now
          </button>
        </div>
      )}
      <ProfileCard />
      <HouseholdCard />
      <PersonalityCard />
      <h3 className="me-gh">Your profile</h3>
      <div className="melist">
        <MeRow
          emoji="✅"
          title="Your first answers"
          detail={
            view.rechecked ? 'Checked ✓' : `${view.firstAnswers} answers · check they still fit`
          }
          page="recheck"
        />
        <MeRow
          emoji="📖"
          title="Your money terms"
          detail="Adviser words, in plain English"
          page="terms"
        />
        <MeRow
          emoji="🧭"
          title="Your full money profile"
          detail={`${view.deeperAnswered} of ${NEW_QUESTIONS.length} deeper questions`}
          page="um"
          right={<span className="me-pct">{view.percent}%</span>}
        />
      </div>
      <h3 className="me-gh">Settings</h3>
      <div className="melist">
        {view.inApp ? (
          <MeRow emoji="💶" title="My money" detail="Finances and documents" page="money" />
        ) : (
          <MeRow
            emoji="💶"
            title="My money"
            detail="Added when you make your plan"
            action="makeplan"
            onClick={makePlan}
          />
        )}
        {adviser ? (
          <MeRow
            emoji="🤝"
            title="Your adviser profile"
            detail="Cal.com link and your card"
            page="adviser"
          />
        ) : null}
        {SETTINGS.map((row) => (
          <MeRow key={row.page} {...row} />
        ))}
        <SignOutRow />
      </div>
      <p className="disc">
        None of this is required. It sharpens your plan and means your adviser won't ask you again.
      </p>
    </AppScreen>
  )
}

import { useShallow } from 'zustand/react/shallow'
import { moneyTerms } from '../../domain/discovery/moneyTerms.ts'
import { personality } from '../../domain/discovery/profile.ts'
import { profilePills, profileRead } from '../../domain/discovery/profileCard.ts'
import { TERMS } from '../../domain/discovery/terms.data.ts'
import { toolsForYou } from '../../domain/explore/picks.ts'
import { PLAN_BUILDER_STEPS, planBuilderStep } from '../../domain/journey/planBuilderSteps.ts'
import { useProfileAnswers } from '../../hooks/useProfileAnswers.ts'
import { dateLine, greeting } from '../../lib/greeting.ts'
import { openCalculator } from '../../state/explore.ts'
import { useStore } from '../../state/store.ts'
import { toolById } from '../explore/tools.data.ts'
import WatchPicks from '../explore/WatchPicks.tsx'
import AppScreen from '../frame/AppScreen.tsx'
import { makePlan } from '../../state/plan.ts'
import AskBar from './AskBar.tsx'
import { ServiceTile } from './Shortcuts.tsx'

const SHOWN_TERMS = 3
const METER_STEPS = [1, 2, 3, 4]

/** Home's hero before a plan: date, greeting, name and a pill to the money personality. */
function StartHero() {
  const name = useStore((store) => store.plan.account.name)
  const openMe = useStore((store) => store.openMe)
  const type = personality(useProfileAnswers())
  const page = type ? 'terms' : 'recheck'

  return (
    <div className="h0hero">
      <span className="hfx" aria-hidden="true">
        <i className="o1"></i>
        <i className="o2"></i>
      </span>
      <span className="h0date">{dateLine()}</span>
      <span className="h0hi">{greeting()}</span>
      <h2 className="t" tabIndex={-1}>
        {name || 'Welcome to Life Map'}
      </h2>
      <button className="h0pill" data-a="me" data-p={page} onClick={() => openMe(page)}>
        <span className="h0badge" aria-hidden="true">
          {type ? type.emoji : '🧭'}
        </span>
        <span>
          {type ? (
            <>
              Your money personality: <b>{type.name}</b>
            </>
          ) : (
            'See your money personality'
          )}
        </span>
        <span className="chev" aria-hidden="true">
          ›
        </span>
      </button>
    </div>
  )
}

/** The card under the hero: start the plan builder, or carry on where the customer left it. */
function PlanCard() {
  const step = useStore((store) =>
    store.planBuilder && store.builderAt ? planBuilderStep(store.builderAt) : 0,
  )
  const card = step
    ? {
        title: 'Carry on with your plan',
        due: `Step ${step} of ${PLAN_BUILDER_STEPS.length} · ${PLAN_BUILDER_STEPS[step - 1].label.toLowerCase()}`,
        foot: 'Everything so far is saved.',
        cta: 'Carry on',
      }
    : {
        title: 'Make my plan',
        due: `About 10 minutes · ${PLAN_BUILDER_STEPS.length} short steps`,
        foot: 'Goals, timeline and money in one plan.',
        cta: 'Start',
      }

  return (
    <div className="card h0plan">
      <div className="row" style={{ alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <b className="h0pt">{card.title}</b>
          <div className="small h0due">
            <span aria-hidden="true">🕒</span> {card.due}
          </div>
        </div>
        <span className="h0art" aria-hidden="true">
          🗺️
        </span>
      </div>
      <div className="h0foot">
        <span className="small">{card.foot}</span>
        <button className="btn sm" data-a="makeplan" onClick={makePlan}>
          {card.cta}
        </button>
      </div>
    </div>
  )
}

/** The money personality e-card with risk and cushion pills, then the customer's first terms. */
function ProfileCard() {
  const answers = useProfileAnswers()
  const read = useStore(
    useShallow((store) => {
      const { comfort, cushion } = profileRead(store.plan)
      return { comfort, cushion }
    }),
  )
  const openMe = useStore((store) => store.openMe)
  const type = personality(answers)
  if (!type) return null
  const terms = moneyTerms(answers)
    .flatMap((group) => group.terms)
    .slice(0, SHOWN_TERMS)

  return (
    <>
      <div className="sec">
        <h3>Your profile card</h3>
        <button className="link" data-a="me" data-p="terms" onClick={() => openMe('terms')}>
          All terms
        </button>
      </div>
      <div className="ecard ec3">
        <span className="ec3-ic" aria-hidden="true">
          {type.emoji}
        </span>
        <div className="ec3-m">
          <small>Money personality</small>
          <b>{type.name}</b>
          <span>{type.strapline}</span>
        </div>
        <div className="ec3-pills">
          {profilePills(read).map((pill) => (
            <span key={pill.label} className="ec3-p">
              <span className="ec3-pi" aria-hidden="true">
                {pill.icon}
              </span>
              <span className="ec3-pt">
                <small>{pill.label}</small>
                <b>{pill.value || '–'}</b>
                <i className="ec3-mt" aria-hidden="true">
                  {METER_STEPS.map((step) => (
                    <em key={step} className={step <= pill.level ? 'on' : undefined}></em>
                  ))}
                </i>
              </span>
            </span>
          ))}
        </div>
      </div>
      <div className="card" style={{ marginTop: 12 }}>
        {terms.map((term) => (
          <div key={term} className="term">
            <span className="tg">◆ {term}</span>
            <span className="tm">{TERMS[term]}</span>
          </div>
        ))}
      </div>
    </>
  )
}

/** Home before a plan (HOME-0). */
export default function HomeStart() {
  const specs = useStore(useShallow((store) => store.plan.goals.map((goal) => goal.spec)))
  const switchTab = useStore((store) => store.switchTab)
  return (
    <AppScreen
      id="HOME-0"
      note="Home before a plan (layout v15, 11 Oct 2026, from the customer's insurance-app reference): gradient hero with greeting, glass pill to the money personality, overlapping Make my plan card, tools as service chips, personality e-card with terms, videos."
    >
      <StartHero />
      <PlanCard />
      <AskBar />
      <div className="sec">
        <h3>Tools to try</h3>
        <button className="link" data-a="tab" data-p="explore" onClick={() => switchTab('explore')}>
          Explore
        </button>
      </div>
      <div className="svc2">
        {toolsForYou(specs).map((id) => {
          const tool = toolById(id)
          return (
            <ServiceTile
              key={id}
              emoji={tool.emoji}
              title={tool.name}
              text={tool.question}
              a="calc"
              p={id}
              onClick={() => openCalculator(id)}
            />
          )
        })}
      </div>
      <ProfileCard />
      <WatchPicks specs={specs} />
      <p className="disc">Guidance, not advice.</p>
    </AppScreen>
  )
}

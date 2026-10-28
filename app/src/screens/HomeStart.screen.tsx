import { cushion } from '../domain/discovery/cushion.ts'
import { moneyTerms } from '../domain/discovery/moneyTerms.ts'
import { personality, suggestedHorizon } from '../domain/discovery/profile.ts'
import { COMFORT_LABELS } from '../domain/discovery/profile.data.ts'
import { riskRead } from '../domain/discovery/riskRead.ts'
import { TERMS } from '../domain/discovery/terms.data.ts'
import { useProfileAnswers } from '../components/discover/useProfileAnswers.ts'
import HdrBar from '../components/frame/HdrBar.tsx'
import { PLAN_BUILDER_STEPS, planBuilderStep } from '../components/frame/planBuilderSteps.ts'
import GIcon from '../components/ui/GIcon.tsx'
import { localToday } from '../lib/today.ts'
import { rerender } from '../state/shell.ts'
import { useStore } from '../state/store.ts'
import { startPlan } from './PlanEmpty.screen.tsx'

export const key = 'HOME0'
export const id = 'HOME-0'
export const note =
  "Home before a plan (layout v15, 11 Oct 2026, from the customer's insurance-app reference): gradient hero with greeting, glass pill to the money personality, overlapping Make my plan card, tools as service chips, personality e-card with terms, videos."

// TODO(R-24): the calculator catalogue (R-27/R-28) owns these; import it when it lands.
type Tool = [emoji: string, name: string, question: string]
const TOOLS: Record<string, Tool> = {
  borrow: ['🏡', 'How much could I borrow?', 'What home price could be within reach?'],
  deposit: ['🐷', 'Deposit calculator', 'How long until I have my deposit?'],
  retirement: [
    '🌅',
    'Retirement projection',
    'Could your current path fund the retirement you want?',
  ],
  contrib: ['➕', 'Contribution impact', 'What difference would a small increase make?'],
  goalplanner: ['🎯', 'Goal planner', 'How much a month to reach my goal?'],
  emergency: ['🪂', 'Emergency fund', 'How strong is my emergency fund?'],
  surplus: ['➗', 'Monthly surplus', 'What is left at the end of the month?'],
  lifecover: ['🛡️', 'Life cover estimator', 'How much cover might my family need?'],
  compound: ['🌱', 'Compound growth', 'What could regular saving grow into?'],
}
const TOOLS_FOR_GOAL: Record<string, string[]> = {
  mortgage: ['borrow', 'deposit'],
  pension: ['retirement', 'contrib'],
}
const EVERYONE_TOOLS = ['goalplanner', 'emergency', 'surplus', 'lifecover', 'compound']

/** Up to six calculators: the ones for the customer's goals first. */
const toolsFor = (goalSpecs: string[]) =>
  [
    ...new Set([...goalSpecs.flatMap((spec) => TOOLS_FOR_GOAL[spec] ?? []), ...EVERYONE_TOOLS]),
  ].slice(0, 6)

function greeting() {
  const hour = new Date().getHours()
  return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
}

const today = () => localToday((globalThis as { __TODAY?: string }).__TODAY)
const dateLine = (date: Date) =>
  `${date.toLocaleDateString('en-GB', { weekday: 'long' })} · ${date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}`

// TODO(R-24): explore and Me navigation become named store actions (R-27, R-26).
function openTerms() {
  useStore.getState().update((plan) => {
    plan.tab = 'me'
    plan.me = 'terms'
  })
  useStore.getState().closeSheet()
}
function openCalculator(calculator: string) {
  useStore.getState().update((plan) => {
    if (plan.tab !== 'explore') {
      plan.tab = 'explore'
      plan.xs = []
    }
    plan.xs.push({ v: 'CALC', p: calculator })
  })
  useStore.getState().closeSheet()
  rerender()
}
function openExplore() {
  useStore.getState().switchTab('explore')
  rerender()
}

const Meter = ({ filled }: { filled: number }) => (
  <i className="ec3-mt" aria-hidden="true">
    {[1, 2, 3, 4].map((step) => (
      <em key={step} className={step <= filled ? 'on' : undefined}></em>
    ))}
  </i>
)

export const Head = () => HdrBar({})

export function Body() {
  const answers = useProfileAnswers()
  const plan = useStore((store) => store.plan)
  const screen = useStore((store) => store.screen)
  const openAsk = useStore((store) => store.openAsk)
  const type = personality(answers)
  const step = plan.pb ? planBuilderStep(screen) : 0
  const read = riskRead(answers, {
    complete: false,
    cushion: cushion(plan),
    suggestedHorizon: suggestedHorizon(plan.goals, plan.about.age ?? 0, plan.retireAge),
  })
  const terms = moneyTerms(answers)
    .flatMap((group) => group.terms)
    .slice(0, 3)
  const risks = [
    {
      icon: '🌦️',
      label: 'Risk',
      value: read.comfort,
      filled: COMFORT_LABELS.indexOf(read.comfort ?? '') + 1,
    },
    { icon: '🛟', label: 'Cushion', value: read.cushion, filled: read.cushion ? 1 : 0 },
  ]

  return (
    <>
      <div className="h0hero">
        <span className="hfx" aria-hidden="true">
          <i className="o1"></i>
          <i className="o2"></i>
        </span>
        <span className="h0date">{dateLine(today())}</span>
        <span className="h0hi">{greeting()}</span>
        <h2 className="t" tabIndex={-1}>
          {plan.acct.name || 'Welcome to Life Map'}
        </h2>
        {type ? (
          <button className="h0pill" data-a="me" data-p="terms" onClick={openTerms}>
            <span className="h0badge" aria-hidden="true">
              {type.emoji}
            </span>
            <span>
              Your money personality: <b>{type.name}</b>
            </span>
            <span className="chev" aria-hidden="true">
              ›
            </span>
          </button>
        ) : (
          // TODO(R-24): 'recheck' opens Me's Discover recheck (R-26).
          <button className="h0pill" data-a="me" data-p="recheck" onClick={openTerms}>
            <span className="h0badge" aria-hidden="true">
              🧭
            </span>
            <span>See your money personality</span>
            <span className="chev" aria-hidden="true">
              ›
            </span>
          </button>
        )}
      </div>
      <div className="card h0plan">
        <div className="row" style={{ alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <b className="h0pt">{step ? 'Carry on with your plan' : 'Make my plan'}</b>
            <div className="small h0due">
              <span aria-hidden="true">🕒</span>{' '}
              {step
                ? `Step ${step} of 8 · ${PLAN_BUILDER_STEPS[step - 1].label.toLowerCase()}`
                : 'About 10 minutes · 8 short steps'}
            </div>
          </div>
          <span className="h0art" aria-hidden="true">
            🗺️
          </span>
        </div>
        <div className="h0foot">
          <span className="small">
            {step ? 'Everything so far is saved.' : 'Goals, timeline and money in one plan.'}
          </span>
          <button className="btn sm" data-a="makeplan" onClick={startPlan}>
            {step ? 'Carry on' : 'Start'}
          </button>
        </div>
      </div>
      {/* TODO(R-24): AskBar from src/components/ask (R-31) */}
      <button className="askbar" data-a="ask" onClick={openAsk}>
        <span className="ab-spark" aria-hidden="true">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="1.8"
            strokeLinejoin="round"
          >
            <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"></path>
            <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"></path>
          </svg>
        </span>
        <span className="ab-tx">
          Ask <b>Life Map</b> about your money…
        </span>
        <span className="ab-mic" aria-hidden="true">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <rect x="9" y="3" width="6" height="11" rx="3"></rect>
            <path d="M5 11a7 7 0 0 0 14 0M12 18v3"></path>
          </svg>
        </span>
      </button>
      <div className="sec">
        <h3>Tools to try</h3>
        <button className="link" data-a="tab" data-p="explore" onClick={openExplore}>
          Explore
        </button>
      </div>
      <div className="svc2">
        {toolsFor(plan.goals.map((goal) => goal.spec)).map((tool) => {
          const [emoji, name, question] = TOOLS[tool]
          return (
            <button
              key={tool}
              className="sv2"
              data-a="calc"
              data-p={tool}
              onClick={() => openCalculator(tool)}
            >
              <GIcon emoji={emoji} className="sv2-i" aria-hidden="true" />
              <span className="sv2-t">
                <b>{name}</b>
                <small>{question}</small>
              </span>
              <span className="sv2-go" aria-hidden="true">
                →
              </span>
            </button>
          )
        })}
      </div>
      {type && (
        <>
          <div className="sec">
            <h3>Your profile card</h3>
            <button className="link" data-a="me" data-p="terms" onClick={openTerms}>
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
              {risks.map((risk) => (
                <span key={risk.label} className="ec3-p">
                  <span className="ec3-pi" aria-hidden="true">
                    {risk.icon}
                  </span>
                  <span className="ec3-pt">
                    <small>{risk.label}</small>
                    <b>{risk.value || '–'}</b>
                    <Meter filled={risk.filled} />
                  </span>
                </span>
              ))}
            </div>
          </div>
          <div className="card" style={{ marginTop: 12 }}>
            {terms.map((term) => (
              <div key={term} className="term">
                <span className="tg">◆ {term}</span>
                <span className="tm">{TERMS[term] ?? ''}</span>
              </div>
            ))}
          </div>
        </>
      )}
      {/* TODO(R-24): "Watch · picked for you" from the video catalogue (R-30) */}
      <p className="disc">Guidance, not advice.</p>
    </>
  )
}

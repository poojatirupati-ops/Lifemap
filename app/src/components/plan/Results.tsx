import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { cushion } from '../../domain/discovery/cushion.ts'
import { hasEnoughForPersonality, suggestedHorizon } from '../../domain/discovery/profile.ts'
import { isProfileComplete } from '../../domain/discovery/profileQuestions.ts'
import { riskRead } from '../../domain/discovery/riskRead.ts'
import { assumption } from '../../domain/planning/assumptions.ts'
import { findings, type Protection } from '../../domain/planning/findings.ts'
import { foundations } from '../../domain/planning/foundations.ts'
import { nextFoundation } from '../../domain/planning/nextFoundation.ts'
import type { ProjectionInputs } from '../../domain/planning/planSettings.ts'
import { budget2027Note } from '../../domain/planning/rates.ts'
import { UNCHANGED_IN_2027 } from '../../domain/planning/rules2027.data.ts'
import { useMissingChoices } from '../../hooks/useMissingChoices.ts'
import { useProfileAnswers } from '../../hooks/useProfileAnswers.ts'
import { useProjection, type Projection } from '../../hooks/useProjection.ts'
import { openReport, preloadReport } from '../../report/openReport.ts'
import { useStore } from '../../state/store.ts'
import FoundationLadder from '../home/FoundationLadder.tsx'
import Glance from '../results/Glance.tsx'
import StressCard from '../results/StressCard.tsx'
import Emo from '../ui/Emo.tsx'
import GateNote from '../ui/GateNote.tsx'
import GoalsCard from './GoalsCard.tsx'
import RoughNote from './RoughNote.tsx'
import WhatIfCard from './WhatIfCard.tsx'

type Inputs = ReturnType<typeof useProjection>['inputs']

const ADVISER_QUESTIONS = [
  'Can I retire earlier?',
  'Am I saving enough?',
  'How do I protect my family?',
  'Should I clear my mortgage early?',
  'What about my pension?',
  "I'd like sustainable / ethical options",
]

// `css` is both the card's class and its explain sheet
const CARDS = [
  { key: 'strength', css: 'str', icon: '💪', label: 'Your main strength' },
  { key: 'gap', css: 'gap', icon: '🔎', label: 'Your main gap' },
  { key: 'decision', css: 'dec', icon: '🎯', label: 'Your biggest decision' },
] as const

/** What we found: three cards, each opening its explanation. */
export function Findings(props: {
  plan: ProjectionInputs & { figures: Protection }
  /** the plan without any what-if */
  projection: Projection
}) {
  const openSheet = useStore((store) => store.openSheet)
  const found = findings(props.plan, props.projection.rows, props.projection.percent)
  return (
    <div className="found" style={{ marginTop: 8 }}>
      {CARDS.map(({ key, css, icon, label }) => (
        <button
          key={key}
          className={`fcard f2c ${css}`}
          onClick={() => openSheet(`explain|${css}`)}
        >
          <span className="f2c-i" aria-hidden="true">
            {icon}
          </span>
          <span className="f2c-m">
            <small>{label}</small>
            <b>
              <Emo>{found[key]}</Emo>
            </b>
          </span>
          <span className="f2c-go" aria-hidden="true">
            ›
          </span>
        </button>
      ))}
    </div>
  )
}

/** What we found, then "That makes sense" or, once understood, questions for an adviser. */
function FoundCard({ inputs, projection }: { inputs: Inputs; projection: Projection }) {
  const { understood, asked } = useStore(
    useShallow(({ plan }) => ({ understood: plan.understood, asked: plan.adviserQuestions })),
  )
  const markUnderstood = useStore((store) => store.markUnderstood)
  const toggleAdviserQuestion = useStore((store) => store.toggleAdviserQuestion)
  return (
    <div className="card" id="r-found">
      <h3 className="h">What we found</h3>
      <Findings plan={inputs} projection={projection} />
      {understood ? (
        <>
          <p className="pill ok" style={{ margin: '12px 0 8px' }}>
            ✓ Thanks, noted
          </p>
          <div className="small" style={{ fontWeight: 800, marginBottom: 6 }}>
            What would you like to ask an adviser? (optional)
          </div>
          <div className="chips">
            {ADVISER_QUESTIONS.map((question) => (
              <button
                key={question}
                className={asked.includes(question) ? 'chip sm sel' : 'chip sm'}
                aria-pressed={asked.includes(question)}
                data-a="advq"
                data-p={question}
                onClick={() => toggleAdviserQuestion(question)}
              >
                {question}
              </button>
            ))}
          </div>
          <p className="small" style={{ margin: '6px 0 0' }}>
            Sustainable / ethical options: your adviser will ask about this before recommending
            anything.
          </p>
        </>
      ) : (
        <button
          className="btn"
          style={{ marginTop: 12 }}
          data-a="understood"
          onClick={markUnderstood}
        >
          That makes sense
        </button>
      )}
    </div>
  )
}

/** The risk profile as it reads now, with a way to finish or view it in Me. */
function ProfileBanner({ inputs }: { inputs: Inputs }) {
  const answers = useProfileAnswers()
  const openMe = useStore((store) => store.openMe)
  const openProfile = useStore((store) => store.openProfile)
  const complete = useStore((store) => isProfileComplete(store.plan))
  const enough = hasEnoughForPersonality(answers.discover)
  const read =
    enough &&
    riskRead(answers, {
      complete,
      cushion: cushion(inputs),
      suggestedHorizon: suggestedHorizon(inputs.goals, inputs.about.age ?? 0, inputs.retireAge),
    })
  return (
    <div className="banner" id="r-prof">
      <span aria-hidden="true">🧭</span>
      {read ? (
        <>
          <span>
            <b>
              Risk profile{read.provisional && read.label ? ' (first read)' : ''}:{' '}
              {read.label || 'Not answered yet'}
            </b>{' '}
            <span className="small">
              · {complete ? 'from your profile in Me' : 'Finish in Me to confirm'}
            </span>
          </span>
          <button className="link" data-a="toprofile" onClick={openProfile}>
            {complete ? 'View' : 'Finish in Me'}
          </button>
        </>
      ) : (
        <>
          <span>
            <b>Risk profile: not enough answers yet</b>
          </span>
          <button className="link" data-a="me" data-p="recheck" onClick={() => openMe('recheck')}>
            Answer in Me
          </button>
        </>
      )}
    </div>
  )
}

/** "Your financial foundations": the full ladder with each level's status and the next best step. */
function FoundationsCard({ projection }: { projection: Projection }) {
  const plan = useStore((store) => store.plan)
  const { levels, next } = useMemo(() => {
    const levels = foundations(plan, projection)
    return { levels, next: nextFoundation(levels, assumption(plan, 'safetyMonths')) }
  }, [plan, projection])
  return (
    <div className="card" id="r-fnd">
      <h3 className="h">Your financial foundations</h3>
      <p className="small" style={{ margin: '0 0 6px' }}>
        Good planning is built from the bottom up. Tap a level to see why it matters.
      </p>
      <FoundationLadder levels={levels} next={next} />
    </div>
  )
}

/** The tax year the plan uses, its first sentence in bold, and which figures are provisional. */
function TaxNote({ startYear }: { startYear: number }) {
  const [first, ...rest] = budget2027Note(startYear).split('. ')
  return (
    <>
      <b>{first}.</b> {rest.join('. ')}{' '}
      <details style={{ marginTop: 4 }}>
        <summary
          style={{
            minHeight: 44,
            display: 'inline-flex',
            alignItems: 'center',
            cursor: 'pointer',
            fontWeight: 700,
          }}
        >
          Which figures are provisional?
        </summary>
        <span className="small" style={{ display: 'block' }}>
          Announced 2027 changes are used from their start dates: income tax bands and credits, the
          USC 2% band, the State Pension, exit tax at 35% and capital gains tax at 31%. They may
          change when the Finance Bill is enacted. {UNCHANGED_IN_2027} PRSI on pension (ARF)
          withdrawals is unresolved: the plan assumes it applies. Projections are illustrative, not
          guaranteed.
        </span>
      </details>
    </>
  )
}

/** Your results: goals, what we found, foundations, what-if, at a glance, the stress test and the three end actions. */
export default function Results() {
  const missing = useMissingChoices()
  const { inputs, whatIf, base, withWhatIf } = useProjection()
  const savedWhatIf = useStore((store) => store.plan.whatIf)
  const versions = useStore((store) => store.plan.versions.length)
  const openSheet = useStore((store) => store.openSheet)
  const fixChoice = useStore((store) => store.fixChoice)
  const bookAdviser = useStore((store) => store.bookAdviser)
  const showSection = useStore((store) => store.showSection)
  if (missing.length) return <GateNote where="res" missing={missing} onChoose={fixChoice} />

  return (
    <>
      <div className="prelim">
        <span aria-hidden="true">ℹ️</span>
        <span>
          Guidance from your figures, not financial advice.{' '}
          <button
            className="link"
            style={{ padding: 0, fontSize: 12.5 }}
            data-a="sheet"
            data-p="assume"
            onClick={() => openSheet('assume')}
          >
            What we assume
          </button>
        </span>
      </div>
      <RoughNote />
      <ProfileBanner inputs={inputs} />
      <GoalsCard inputs={inputs} whatIf={whatIf} projection={withWhatIf} />
      <FoundCard inputs={inputs} projection={base} />
      <FoundationsCard projection={base} />
      <WhatIfCard goals={inputs.goals} whatIf={savedWhatIf} base={base} withWhatIf={withWhatIf} />
      <div className="card" id="r-glancec">
        <h3 className="h">Your future, at a glance</h3>
        <div id="r-glance">
          <Glance projection={withWhatIf} />
        </div>
      </div>
      <StressCard inputs={inputs} whatIf={whatIf} />
      <div className="ends">
        <button
          className="btn navy"
          data-a="report"
          onClick={openReport}
          onPointerEnter={preloadReport}
          onFocus={preloadReport}
        >
          ⬇ Download my plan
        </button>
        <button className="btn sun" data-a="book" onClick={bookAdviser}>
          📅 Book my adviser meeting
        </button>
        <button className="btn ghost" data-a="adjust" onClick={() => showSection('timeline')}>
          ✏️ Adjust my goals
        </button>
      </div>
      <div className="disc" id="b27-res">
        <TaxNote startYear={assumption(inputs, 'startYear')} />
      </div>
      <p className="disc">
        Guidance, not advice. Projections are illustrative, use standard assumptions and are not
        guaranteed. Only an authorised adviser who knows your full situation can give advice.{' '}
        {versions > 0 ? (
          <button
            className="link"
            style={{ fontSize: 12, padding: 0 }}
            data-a="sheet"
            data-p="history"
            onClick={() => openSheet('history')}
          >
            Plan history ({versions})
          </button>
        ) : null}
      </p>
    </>
  )
}

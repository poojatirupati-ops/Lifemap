import type { CSSProperties, UIEvent } from 'react'
import { cushion as readCushion } from '../../domain/discovery/cushion.ts'
import { answerTag } from '../../domain/discovery/moneyTerms.ts'
import { personality, suggestedHorizon } from '../../domain/discovery/profile.ts'
import { riskRead } from '../../domain/discovery/riskRead.ts'
import { DISCOVERY_DISCLAIMER } from '../../domain/identity/personality.data.ts'
import { useStore } from '../../state/store.ts'
import MismatchPanel from './MismatchPanel.tsx'
import MoneyTerms from './MoneyTerms.tsx'
import PersonalityCard from './PersonalityCard.tsx'
import RiskStats from './RiskStats.tsx'
import { backFromReveal } from './discoverActions.ts'
import { useProfileAnswers } from './useProfileAnswers.ts'

const HERO_PHOTO: Record<string, string> = {
  Achiever: 'url(media/graduation.jpg)',
  Balancer: 'url(media/savings-jar.jpg)',
  Contented: 'url(media/retired-reading.jpg)',
}
const columnFoot: CSSProperties = { flexDirection: 'column', alignItems: 'stretch', gap: 6 }

/** Past the photo the top bar turns frosted (.dscrolled on the quiz frame). */
const frostHeaderOnScroll = ({ currentTarget: page }: UIEvent<HTMLDivElement>) =>
  page.closest('.quiz')?.classList.toggle('dscrolled', page.scrollTop > 140)

/** The money personality, risk appetite and cushion, the customer's terms and at most one hint. */
export default function PersonalityReveal() {
  const answers = useProfileAnswers()
  const plan = useStore((store) => store.plan)
  const type = personality(answers)!
  const cushion = readCushion(plan)
  const read = riskRead(answers, {
    complete: false,
    cushion,
    suggestedHorizon: suggestedHorizon(plan.goals, plan.about.age ?? 0, plan.retireAge),
  })

  return (
    <>
      <div className="qtop dtop">
        <button
          className="dcirc"
          data-a="dprev"
          aria-label="Back to the questions"
          onClick={backFromReveal}
        >
          ‹
        </button>
        <span className="dtitle">Your money personality</span>
        <span className="dcirc" aria-hidden="true" style={{ visibility: 'hidden' }} />
      </div>
      <div className="qbody dpage" onScroll={frostHeaderOnScroll}>
        <div
          className="dhero"
          aria-hidden="true"
          style={{
            backgroundImage: HERO_PHOTO[type.name] ?? 'var(--cover-photo)',
            backgroundPosition: 'center 40%',
          }}
        />
        <PersonalityCard type={type} />
        <RiskStats
          comfort={read.comfort}
          cushion={cushion}
          cushionLevel={read.cushion}
          appetiteTerm={answerTag(answers.discover, '8')}
          surpriseTerm={answerTag(answers.discover, '7')}
        />
        {read.cushionNote && (
          <p className="small" style={{ margin: '8px 2px 0' }}>
            {read.cushionNote}
          </p>
        )}
        <div className="panel" style={{ marginTop: 12 }}>
          <div className="qeye">Your money terms</div>
          <p className="small" style={{ margin: '4px 0 0' }}>
            The words an adviser would use, and what they mean for you.
          </p>
          <MoneyTerms answers={answers} />
        </div>
        {read.mismatch && (
          <MismatchPanel
            message={read.mismatch}
            offerEmergencyFund={!!read.cushion && read.cushion !== 'In place'}
          />
        )}
        <p className="disc">A first read from 6 answers, not advice. {DISCOVERY_DISCLAIMER}</p>
      </div>
      <div className="qfoot" style={columnFoot}>
        <p className="fnote">Get a more accurate picture</p>
        <button className="wbtn" data-a="drplan" onClick={() => useStore.getState().go('DS')}>
          Continue
        </button>
      </div>
    </>
  )
}

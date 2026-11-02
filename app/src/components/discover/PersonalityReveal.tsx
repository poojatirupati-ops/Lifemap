import type { UIEvent } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { cushion as readCushion } from '../../domain/discovery/cushion.ts'
import { answerTag } from '../../domain/discovery/moneyTerms.ts'
import { suggestedHorizonFor } from '../../domain/discovery/profile.ts'
import { APPETITE_QUESTION, SURPRISE_QUESTION } from '../../domain/discovery/questions.data.ts'
import { riskRead } from '../../domain/discovery/riskRead.ts'
import {
  DISCOVERY_DISCLAIMER,
  type PersonalityType,
} from '../../domain/identity/personality.data.ts'
import { useProfileAnswers } from '../../hooks/useProfileAnswers.ts'
import { useStore } from '../../state/store.ts'
import ColumnFoot from './ColumnFoot.tsx'
import MismatchPanel from './MismatchPanel.tsx'
import MoneyTerms from './MoneyTerms.tsx'
import PersonalityCard from './PersonalityCard.tsx'
import RiskStats from './RiskStats.tsx'

const HERO_PHOTO: Record<string, string> = {
  Achiever: 'url(media/graduation.jpg)',
  Balancer: 'url(media/savings-jar.jpg)',
  Contented: 'url(media/retired-reading.jpg)',
}

/** Past the photo the top bar turns frosted (.dscrolled on the quiz frame). */
// TODO(R-03): the quiz frame in ScreenHost should own .dscrolled from its own scroll state
const frostHeaderOnScroll = ({ currentTarget: page }: UIEvent<HTMLDivElement>) =>
  page.closest('.quiz')?.classList.toggle('dscrolled', page.scrollTop > 140)

/** The money personality, risk appetite and cushion, the customer's terms and at most one hint. */
export default function PersonalityReveal({ type }: { type: PersonalityType }) {
  const answers = useProfileAnswers()
  const cushion = useStore(useShallow(({ plan }) => readCushion(plan)))
  const horizon = useStore(({ plan }) => suggestedHorizonFor(plan))
  const backFromReveal = useStore((store) => store.backFromReveal)
  const finishOnboarding = useStore((store) => store.finishOnboarding)
  const read = riskRead(answers, { complete: false, cushion, suggestedHorizon: horizon })

  return (
    <>
      <div className="qtop dtop">
        <button className="dcirc" aria-label="Back to the questions" onClick={backFromReveal}>
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
          read={read}
          cushion={cushion}
          appetiteTerm={answerTag(answers.discover, APPETITE_QUESTION)}
          surpriseTerm={answerTag(answers.discover, SURPRISE_QUESTION)}
        />
        {read.cushionNote ? (
          <p className="small" style={{ margin: '8px 2px 0' }}>
            {read.cushionNote}
          </p>
        ) : null}
        <div className="panel" style={{ marginTop: 12 }}>
          <div className="qeye">Your money terms</div>
          <p className="small" style={{ margin: '4px 0 0' }}>
            The words an adviser would use, and what they mean for you.
          </p>
          <MoneyTerms answers={answers} />
        </div>
        {read.mismatch ? (
          <MismatchPanel
            message={read.mismatch}
            offerEmergencyFund={!!read.cushion && read.cushion !== 'In place'}
          />
        ) : null}
        <p className="disc">A first read from 6 answers, not advice. {DISCOVERY_DISCLAIMER}</p>
      </div>
      <ColumnFoot>
        <p className="fnote">Get a more accurate picture</p>
        <button className="wbtn" onClick={finishOnboarding}>
          Continue
        </button>
      </ColumnFoot>
    </>
  )
}

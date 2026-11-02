import { useShallow } from 'zustand/react/shallow'
import { moneyTerms } from '../../domain/discovery/moneyTerms.ts'
import { personality } from '../../domain/discovery/profile.ts'
import { profilePills, profileRead } from '../../domain/discovery/profileCard.ts'
import { TERMS } from '../../domain/discovery/terms.data.ts'
import { useProfileAnswers } from '../../hooks/useProfileAnswers.ts'
import { useStore } from '../../state/store.ts'
import Meter from './Meter.tsx'

const SHOWN_TERMS = 3

/** The money personality e-card with risk and cushion pills, then the customer's first terms. */
export default function ProfileCard() {
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
                <Meter level={pill.level} />
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

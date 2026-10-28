import { useStore } from '../../state/store.ts'
import { setPlanningWithPartner } from './aboutActions.ts'

const CHOICES = [
  { together: true, answer: 'Yes', emoji: '💑', title: 'Together', detail: 'As a couple' },
  { together: false, answer: 'No', emoji: '🙋', title: 'Just me', detail: 'On my own' },
]

/** "Planning with a partner?" as two illustrated tiles. */
export default function PartnerTiles() {
  const partner = useStore((store) => store.plan.about.partner)

  return (
    <div className="bchoice" role="group" aria-label="Planning with a partner">
      {CHOICES.map(({ together, answer, emoji, title, detail }) => {
        const on = partner === together
        return (
          <button
            key={answer}
            className={on ? 'bch on' : 'bch'}
            aria-pressed={on}
            data-a="partner"
            data-p={answer}
            onClick={() => setPlanningWithPartner(together)}
          >
            <span className="bch-ic" aria-hidden="true">
              {emoji}
            </span>
            <b>{title}</b>
            <small>{detail}</small>
          </button>
        )
      })}
    </div>
  )
}

import { toolById } from '../explore/explore.data.ts'
import { openCalculator } from '../explore/exploreActions.ts'
import { CALCULATOR_CARDS, photo } from './mortgages.data.ts'

/** Every mortgage calculator as a photo card, the most relevant one first. */
export default function CalculatorGrid({ calculators }: { calculators: string[] }) {
  return (
    <>
      <div className="mp-sec" id="mp-calc">
        <h3>Calculators for you</h3>
        <span>
          {calculators.length} of {calculators.length}
        </span>
      </div>
      <div className="mp-grid">
        {calculators.map((id, i) => {
          const card = CALCULATOR_CARDS[id]
          const name = card.name ?? toolById(card.tool).name
          return (
            <button
              key={id}
              className={i === 0 ? 'mp-gc big' : 'mp-gc'}
              data-a="calc"
              data-p={card.tool}
              aria-label={`${card.label}: ${name}`}
              onClick={() => openCalculator(card.tool)}
            >
              <span
                className="gc-ph"
                style={{ backgroundImage: `url('${photo(card.photo)}')` }}
                aria-hidden="true"
              ></span>
              <span className="gc-e" aria-hidden="true">
                {card.emoji}
              </span>
              <span className="gc-tx">
                <b>{card.label}</b>
                <small>{name}</small>
              </span>
              <span className="gc-go" aria-hidden="true">
                →
              </span>
            </button>
          )
        })}
      </div>
    </>
  )
}

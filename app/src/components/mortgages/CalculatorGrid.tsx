import clsx from 'clsx'
import { toolById } from '../explore/tools.data.ts'
import { openCalculator } from '../../state/explore.ts'
import type { CalculatorCard } from '../../content/cms.tsx'
import { photo } from './mortgages.data.ts'

/** Every mortgage calculator as a photo card, the most relevant one first. */
export default function CalculatorGrid({ calculators }: { calculators: CalculatorCard[] }) {
  // Every mortgage calculator is offered, so the count reads "7 of 7" like the original.
  const count = calculators.length
  return (
    <>
      <div className="mp-sec" id="mp-calc">
        <h3>Calculators for you</h3>
        <span>
          {count} of {count}
        </span>
      </div>
      <div className="mp-grid">
        {calculators.map((card, i) => {
          const name = card.name ?? toolById(card.tool).name
          return (
            <button
              key={card.label}
              className={clsx('mp-gc', { big: i === 0 })}
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

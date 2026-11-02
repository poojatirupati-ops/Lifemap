import clsx from 'clsx'
import { useMortgagePage } from '../../state/mortgage.ts'
import { READING_PHOTOS, photoAt, type Reading } from './mortgages.data.ts'

// TODO(R-29): the original shows this placeholder until docs/content/mortgage/ has the body text.
const PLACEHOLDER = 'TODO: content to come from docs/content/mortgage/ (not added yet).'

/** Articles, FAQs and links; opening one shows it below the cards. */
export default function ReadingCards({ reading }: { reading: Reading[] }) {
  const openReading = useMortgagePage((p) => p.openReading)
  const toggleReading = useMortgagePage((p) => p.toggleReading)
  const open = openReading === null ? undefined : reading[openReading]

  return (
    <>
      <div className="mp-sec" id="mp-read">
        <h3>Read and ask</h3>
      </div>
      <div className="mp-rd rd3" role="group" aria-label="Read and ask">
        {reading.map((item, i) => {
          const isOpen = openReading === i
          return (
            <button
              key={item.title}
              className={clsx('rd-c', { on: isOpen })}
              data-a="mprd"
              data-p={i}
              aria-expanded={isOpen}
              onClick={() => toggleReading(i)}
            >
              <span
                className="rd-ic rd-ph"
                style={{ backgroundImage: `url(${photoAt(READING_PHOTOS, i)})` }}
                aria-hidden="true"
              >
                <i>{item.emoji}</i>
              </span>
              <span className="rd-body">
                <small>{item.kind}</small>
                <b>{item.title}</b>
                <span className="rd-more">
                  {isOpen ? 'Hide' : 'Read more'} <i aria-hidden="true">{isOpen ? '↑' : '→'}</i>
                </span>
              </span>
            </button>
          )
        })}
      </div>
      {open ? (
        <div className="rd-panel" role="region" aria-label={open.kind}>
          <b>{open.title}</b>
          <p>{PLACEHOLDER}</p>
        </div>
      ) : null}
    </>
  )
}

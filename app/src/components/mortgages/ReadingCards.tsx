import clsx from 'clsx'
import { useMortgagePage } from '../../state/mortgage.ts'
import type { Reading } from '../../content/cms.tsx'

const PHOTOS = ['home-keys', 'savings-jar', 'invest-charts']

/** Articles, FAQs and links; opening one shows its text below the cards (none while it has no text). */
export default function ReadingCards({ reading }: { reading: Reading[] }) {
  const openReading = useMortgagePage((p) => p.openReading)
  const { toggleReading } = useMortgagePage.getState()
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
                style={{ backgroundImage: `url(/media/${PHOTOS[i % PHOTOS.length]}.jpg)` }}
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
      {open?.body ? (
        <div className="rd-panel" role="region" aria-label={open.kind}>
          <b>{open.title}</b>
          {open.body.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      ) : null}
    </>
  )
}

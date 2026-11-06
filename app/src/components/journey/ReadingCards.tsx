import clsx from 'clsx'
import { useJourneyActions, useJourneyPage } from '../../state/journeyPage.ts'
import type { Reading } from '../../content/cms.tsx'

/** Articles, FAQs and links; opening one shows its text below the cards (none while it has no text). */
export default function ReadingCards({ reading }: { reading: Reading[] }) {
  const openReading = useJourneyPage((p) => p.openReading)
  const { actionPrefix, toggleReading } = useJourneyActions()
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
              data-a={`${actionPrefix}rd`}
              data-p={i}
              aria-expanded={isOpen}
              onClick={() => toggleReading(i)}
            >
              <span
                className="rd-ic rd-ph"
                style={{ backgroundImage: `url(/media/${item.photo}.jpg)` }}
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

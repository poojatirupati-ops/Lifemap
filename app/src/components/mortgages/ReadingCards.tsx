import { useMortgagePage } from '../../state/mortgage.ts'
import { READING_PHOTOS, photo, type Reading } from './mortgages.data.ts'

/** Articles, FAQs and links; opening one shows it below the cards. */
export default function ReadingCards({ reading }: { reading: Reading[] }) {
  const { openReading, toggleReading } = useMortgagePage()
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
              className={isOpen ? 'rd-c on' : 'rd-c'}
              data-a="mprd"
              data-p={i}
              aria-expanded={isOpen}
              onClick={() => toggleReading(i)}
            >
              <span
                className="rd-ic rd-ph"
                style={{
                  backgroundImage: `url(${photo(READING_PHOTOS[i % READING_PHOTOS.length])})`,
                }}
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
      {open && (
        <div className="rd-panel" role="region" aria-label={open.kind}>
          <b>{open.title}</b>
          <p>TODO: content to come from docs/content/mortgage/ (not added yet).</p>
        </div>
      )}
    </>
  )
}

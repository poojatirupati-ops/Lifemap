import type { CSSProperties } from 'react'
import GIcon from '../ui/GIcon.tsx'
import { STATUS_LABEL, type Foundation } from './foundations.ts'
import type { nextFoundation } from './nextFoundation.ts'
import { openFoundation } from './homeActions.ts'

type Props = {
  levels: Foundation[]
  /** the next best step, shown under the full ladder */
  next?: ReturnType<typeof nextFoundation>
  /** Home's short version: status only, no next step */
  compact?: boolean
}

const isInPlace = ({ status }: Foundation) => status === 'ok' || status === 'held'

/** Summary bar and the five-level ladder, level 1 at the bottom; each level opens its sheet. */
export default function FoundationLadder({ levels, next, compact }: Props) {
  return (
    <>
      <div className="fsum" aria-hidden="true">
        <div className="fbar">
          {levels.map((level) => (
            <i key={level.level} className={`fb-${level.status}`}></i>
          ))}
        </div>
        <span>
          <b>{`${levels.filter(isInPlace).length} of ${levels.length}`}</b> in place
        </span>
      </div>
      <ol
        className={compact ? 'fnd2 sm' : 'fnd2'}
        aria-label="Your financial foundations, from the bottom up"
      >
        {levels.map((level, index) => (
          <li
            key={level.level}
            style={{ width: `${100 - index * 9}%`, '--i': index } as CSSProperties}
          >
            <button
              className={`f2 s-${level.status}`}
              data-a="sheet"
              data-p={`fnd|${index}`}
              onClick={() => openFoundation(index)}
            >
              <span className="f2n" aria-hidden="true">
                {isInPlace(level) ? '✓' : level.level}
              </span>
              <GIcon className="f2e" emoji={level.emoji} aria-hidden="true" />
              <span className="f2m">
                <b>{level.name}</b>
                <span className="f2s">
                  {STATUS_LABEL[level.status] + (compact ? '' : ` · ${level.text}`)}
                </span>
              </span>
              <span className="chev" aria-hidden="true">
                ›
              </span>
            </button>
          </li>
        ))}
      </ol>
      <p className="fhint" aria-hidden="true">
        Built from the bottom up · tap a level
      </p>
      {next && !compact && (
        <p className="small" style={{ margin: '8px 0 0', color: 'var(--ink)' }}>
          <b>Next best step:</b> {`${next.title}. ${next.detail}`}
        </p>
      )}
    </>
  )
}

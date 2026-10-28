import type { CSSProperties } from 'react'

/** The life goals the cover wheel cycles through: a photo (CSS variable) and its caption. */
const GOALS = [
  { art: 'art-mortgage', caption: 'Buy a home' },
  { art: 'art-pension', caption: 'Retire well' },
  { art: 'art-investing', caption: 'Grow your wealth' },
  { art: 'art-savings', caption: 'Build your savings' },
  { art: 'art-travel', caption: "Get where you're going" },
]

const photo = (art: string) => `var(--${art})`
const delay = (i: number) => `${i * 3}s`

/** The cover's photo wheel; useOrbit (in ScreenHost) turns it. */
export default function OrbitWheel() {
  return (
    <div className="orbit-wrap ro live" aria-hidden="true">
      <svg className="oring" viewBox="0 0 300 300">
        <circle cx="150" cy="150" r="122" />
      </svg>
      <div className="otrail">
        <i />
      </div>
      <div className="orbit">
        {GOALS.map(({ art }, i) => (
          <span
            key={art}
            className="o"
            style={{ '--a': `${i * 72 - 90}deg`, '--d': delay(i) } as CSSProperties}
          >
            <i style={{ backgroundImage: photo(art) }} />
          </span>
        ))}
      </div>
      <span className="orbit-c" style={{ backgroundImage: 'var(--cover-photo)' }}>
        {GOALS.map(({ art }, i) => (
          <i key={art} style={{ backgroundImage: photo(art), '--d': delay(i) } as CSSProperties} />
        ))}
      </span>
      <span className="ocap">
        {GOALS.map(({ art, caption }, i) => (
          <b key={art} style={{ '--d': delay(i) } as CSSProperties}>
            {caption}
          </b>
        ))}
      </span>
    </div>
  )
}

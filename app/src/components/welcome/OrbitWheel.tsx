import type { CSSProperties } from 'react'

/** The life goals the cover wheel cycles through: a photo (CSS background) and its caption. */
const GOALS = [
  { photo: 'var(--art-mortgage)', caption: 'Buy a home' },
  { photo: 'var(--art-pension)', caption: 'Retire well' },
  { photo: 'var(--art-investing)', caption: 'Grow your wealth' },
  { photo: 'var(--art-savings)', caption: 'Build your savings' },
  { photo: 'var(--art-travel)', caption: "Get where you're going" },
]

/** Goal i's animation starts 3s after the previous goal's. */
const goalStyle = (i: number) => ({ '--d': `${i * 3}s` }) as CSSProperties

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
        {GOALS.map(({ photo }, i) => (
          <span
            key={photo}
            className="o"
            style={{ ...goalStyle(i), '--a': `${i * 72 - 90}deg` } as CSSProperties}
          >
            <i style={{ backgroundImage: photo }} />
          </span>
        ))}
      </div>
      <span className="orbit-c" style={{ backgroundImage: 'var(--cover-photo)' }}>
        {GOALS.map(({ photo }, i) => (
          <i key={photo} style={{ ...goalStyle(i), backgroundImage: photo }} />
        ))}
      </span>
      <span className="ocap">
        {GOALS.map(({ photo, caption }, i) => (
          <b key={photo} style={goalStyle(i)}>
            {caption}
          </b>
        ))}
      </span>
    </div>
  )
}

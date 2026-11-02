import type { CSSProperties } from 'react'
import type { PersonalityType } from '../../domain/identity/personality.data.ts'

const SPARKS = [0, 1, 2, 3, 4, 5, 6, 7]

/** The type's medal, name, strapline, strengths and one thing to watch. */
export default function PersonalityCard({ type }: { type: PersonalityType }) {
  return (
    <div className="panel dsheet drsheet">
      <div className="drmed" aria-hidden="true">
        <span className="drring" />
        <span className="dremo">{type.emoji}</span>
        {SPARKS.map((spark) => (
          <i key={spark} style={{ '--k': spark } as CSSProperties} />
        ))}
      </div>
      <div className="qeye">You are</div>
      <h2 className="drname" tabIndex={-1}>
        {type.name}
      </h2>
      <p className="qsub" style={{ margin: 0, color: 'var(--ink)' }}>
        {type.strapline}
      </p>
      <div className="drstr">
        {type.strengths.map((strength) => (
          <span key={strength} className="drchip">
            <b aria-hidden="true">✓</b>
            {strength}
          </span>
        ))}
      </div>
      <p className="drwatch">
        <span aria-hidden="true">👀</span>
        <span>
          <b>One to watch:</b> {type.watchOut}
        </span>
      </p>
    </div>
  )
}

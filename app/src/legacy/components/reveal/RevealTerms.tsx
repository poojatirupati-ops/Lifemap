import Card from '../ui/Card.tsx'
import { SECT } from '../../content/discover.data.ts'
import { myTerms } from '../../engine/profile.ts'
import type { Answers } from '../../content/discover.data.ts'

/** The customer's own terms, each with its plain one-line meaning. */
export default function RevealTerms({ ans }: { ans: Answers }) {
  const terms = [...myTerms(ans)]
  if (!terms.length) return null
  return (
    <Card className="rev-terms-card">
      <h2>Your money terms, in plain words</h2>
      <ul className="rev-terms">
        {terms.map(t => (
          <li key={t.section + t.tag}>
            <span className="eyebrow">{SECT[t.section][0]}</span>
            <small className="rev-plain">{SECT[t.section][1]}</small>
            <strong>{t.tag}</strong>
            <span>{t.line}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}

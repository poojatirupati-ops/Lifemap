import type { moneyTerms } from '../../domain/discovery/moneyTerms.ts'
import { PROFILE_SECTIONS, TERMS } from '../../domain/discovery/terms.data.ts'

/** The customer's money terms by section, each with its plain meaning (no section icons). */
export default function TermsList({ terms }: { terms: ReturnType<typeof moneyTerms> }) {
  return terms.map(({ section, terms }) => {
    const { title, plain } = PROFILE_SECTIONS[section]
    return (
      <div key={section} className="tsec">
        <div className="small" style={{ color: 'var(--ink)' }}>
          <b>{title}:</b> {plain}
        </div>
        {terms.map((term) => (
          <div key={term} className="term">
            <span className="tg">◆ {term}</span>
            <span className="tm">{TERMS[term] ?? ''}</span>
          </div>
        ))}
      </div>
    )
  })
}

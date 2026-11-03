import type { moneyTerms } from '../../domain/discovery/moneyTerms.ts'
import { PROFILE_SECTIONS, TERMS } from '../../domain/discovery/terms.data.ts'
import { SECTION_ICONS } from '../ui/icons.tsx'

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

/** Your money terms: a glass card per section, with its line icon, then each term as a pill. */
export function TermCards({ terms }: { terms: ReturnType<typeof moneyTerms> }) {
  return (
    <div className="tm2">
      {terms.map(({ section, terms }) => {
        const { title, plain } = PROFILE_SECTIONS[section]
        return (
          <div key={section} className="tm2-c">
            <div className="tm2-h">
              <span className="tm2-ic">{SECTION_ICONS[section]}</span>
              <div>
                <b>{title}</b>
                <small>{plain}</small>
              </div>
            </div>
            {terms.map((term) => (
              <div key={term} className="tm2-t">
                <span className="tm2-n">{term}</span>
                <p>{TERMS[term] ?? ''}</p>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

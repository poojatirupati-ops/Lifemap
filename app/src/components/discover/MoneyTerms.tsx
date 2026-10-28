import { moneyTerms } from '../../domain/discovery/moneyTerms.ts'
import type { ProfileAnswers } from '../../domain/discovery/profile.ts'
import { PROFILE_SECTIONS, TERMS } from '../../domain/discovery/terms.data.ts'

/** The customer's terms by section, each with its plain meaning. */
export default function MoneyTerms({ answers }: { answers: ProfileAnswers }) {
  return moneyTerms(answers).map(({ section, terms }) => {
    const { title, plain, icon } = PROFILE_SECTIONS[section]
    return (
      <div key={section} className="tsec">
        <div className="tsec-h">
          <span className="tsec-ic" aria-hidden="true">
            {icon}
          </span>
          <span className="small" style={{ color: 'var(--ink)' }}>
            <b>{title}:</b> {plain}
          </span>
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

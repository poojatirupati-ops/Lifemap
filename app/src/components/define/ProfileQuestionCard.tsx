import { useShallow } from 'zustand/react/shallow'
import { euro } from '../../lib/format.ts'
import { useStore } from '../../state/store.ts'
import ProfileOption from './ProfileOption.tsx'
import {
  answerOf,
  editKey,
  pickProfileAnswer,
  suggestedHorizonFor,
  toggleProduct,
  type ProfileQuestion,
} from './profileActions.ts'

const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

/** One money-profile question to answer, labelled "New" or "To answer" unless `label` says otherwise. */
export default function ProfileQuestionCard({
  entry,
  label,
}: {
  entry: ProfileQuestion
  label?: string
}) {
  const { question, discover } = entry
  const { answer, suggestion, products } = useStore(
    useShallow(({ plan }) => ({
      answer: answerOf(plan, entry),
      suggestion: suggestedHorizonFor(plan),
      products: plan.um.chips,
    })),
  )
  const suggested = question.id === 'u9' && answer == null
  const selected = suggested ? suggestion : answer
  const [section, plain] = question.section
  const help = discover ? undefined : question.help
  const panel = discover ? question.from && [question.from, question.to!] : question.panel
  const chips = discover ? undefined : question.chips

  return (
    <div className="card umq">
      <div className="umq-tags">
        <span className="umq-new">{label ?? (discover ? 'To answer' : 'New')}</span>
        <span className="umq-sec">{section}</span>
      </div>
      <p className="umq-what">{capitalise(plain)}</p>
      <h3 className="h umq-q">{question.title}</h3>
      {help && (
        <p className="small" style={{ margin: '0 0 8px' }}>
          {help}
        </p>
      )}
      {panel && (
        <div className="umq-fall">
          <div>
            <small>You put in</small>
            <b>{euro(panel[0])}</b>
          </div>
          <span className="umq-drop">−{Math.round((1 - panel[1] / panel[0]) * 100)}%</span>
          <div style={{ textAlign: 'right' }}>
            <small>{discover ? 'A month later' : 'A year later'}</small>
            <b className="dn">{euro(panel[1])}</b>
          </div>
          <div className="umq-bar">
            <i style={{ width: `${Math.round((panel[1] / panel[0]) * 100)}%` }}></i>
          </div>
        </div>
      )}
      {suggested && (
        <span className="pill sunny" style={{ marginBottom: 8 }}>
          Suggested from your timeline — confirm or change
        </span>
      )}
      <div className="opts" role="group" aria-label={question.title}>
        {question.options.map((option, index) => (
          <ProfileOption
            key={index}
            option={option}
            selected={selected === index}
            code={`${editKey(entry)}|${index}`}
            withTag
            onPick={() => pickProfileAnswer(entry, index)}
          />
        ))}
      </div>
      {chips && (
        <>
          <div className="small" style={{ fontWeight: 800, margin: '12px 0 6px' }}>
            Which have you had? (optional)
          </div>
          <div className="chips">
            {chips.map((chip) => (
              <button
                key={chip}
                className={products.includes(chip) ? 'chip sm sel' : 'chip sm'}
                aria-pressed={products.includes(chip)}
                data-a="umchip"
                data-p={chip}
                onClick={() => toggleProduct(chip)}
              >
                {chip}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

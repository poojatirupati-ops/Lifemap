import { useShallow } from 'zustand/react/shallow'
import { useStore } from '../../state/store.ts'
import Findings from '../results/Findings.tsx'
import type { Projection } from '../../hooks/useProjection.ts'

const ADVISER_QUESTIONS = [
  'Can I retire earlier?',
  'Am I saving enough?',
  'How do I protect my family?',
  'Should I clear my mortgage early?',
  'What about my pension?',
  "I'd like sustainable / ethical options",
]

interface Props {
  inputs: Parameters<typeof Findings>[0]['plan']
  projection: Projection
}

/** What we found, then "That makes sense" or, once understood, questions for an adviser. */
export default function FoundCard({ inputs, projection }: Props) {
  const { understood, asked } = useStore(
    useShallow(({ plan }) => ({ understood: plan.understood, asked: plan.adviserQuestions })),
  )
  const markUnderstood = useStore((store) => store.markUnderstood)
  const toggleAdviserQuestion = useStore((store) => store.toggleAdviserQuestion)
  return (
    <div className="card" id="r-found">
      <h3 className="h">What we found</h3>
      <Findings plan={inputs} projection={projection} />
      {understood ? (
        <>
          <p className="pill ok" style={{ margin: '12px 0 8px' }}>
            ✓ Thanks, noted
          </p>
          <div className="small" style={{ fontWeight: 800, marginBottom: 6 }}>
            What would you like to ask an adviser? (optional)
          </div>
          <div className="chips">
            {ADVISER_QUESTIONS.map((question) => (
              <button
                key={question}
                className={asked.includes(question) ? 'chip sm sel' : 'chip sm'}
                aria-pressed={asked.includes(question)}
                data-a="advq"
                data-p={question}
                onClick={() => toggleAdviserQuestion(question)}
              >
                {question}
              </button>
            ))}
          </div>
          <p className="small" style={{ margin: '6px 0 0' }}>
            Sustainable / ethical options: your adviser will ask about this before recommending
            anything.
          </p>
        </>
      ) : (
        <button
          className="btn"
          style={{ marginTop: 12 }}
          data-a="understood"
          onClick={markUnderstood}
        >
          That makes sense
        </button>
      )}
    </div>
  )
}

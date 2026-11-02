import { toast } from '../../state/shell.ts'
import { useStore } from '../../state/store.ts'

/** Under the match: another adviser, or a call back from this one. */
export default function MatchLinks({ adviserFirstName }: { adviserFirstName: string }) {
  const nextAdviser = useStore((store) => store.nextAdviser)
  return (
    <>
      <button className="link" onClick={nextAdviser}>
        See another match
      </button>
      {' · '}
      <button
        className="link"
        onClick={() => toast(`${adviserFirstName} will call you within 1 working day`)}
      >
        Request a call back
      </button>
    </>
  )
}

import { EXPERTS, type ExpertKind } from '../../domain/identity/advisers.data.ts'
import { useStore } from '../../state/store.ts'

const KINDS = Object.keys(EXPERTS) as ExpertKind[]

/** "Talk to a specialist": one toggle per kind of expert. */
export default function SpecialistBoxes({ selected }: { selected: ExpertKind }) {
  const toggleSpecialist = useStore((store) => store.toggleSpecialist)
  return (
    <>
      <div className="sec">
        <h3>Talk to a specialist</h3>
      </div>
      <div role="group" aria-label="Talk to a specialist">
        {KINDS.map((kind) => {
          const { title, blurb, icon } = EXPERTS[kind]
          const on = kind === selected
          return (
            <button
              key={kind}
              className={on ? 'goal spec sel' : 'goal spec'}
              aria-pressed={on}
              data-a="spec"
              data-p={kind}
              onClick={() => toggleSpecialist(kind)}
            >
              <span className="ic" aria-hidden="true">
                {icon}
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <b>{title}</b>
                <br />
                <span className="small">{blurb}</span>
              </span>
              <span className="ck2" aria-hidden="true">
                ✓
              </span>
              <span className="chev" aria-hidden="true">
                ›
              </span>
            </button>
          )
        })}
      </div>
    </>
  )
}

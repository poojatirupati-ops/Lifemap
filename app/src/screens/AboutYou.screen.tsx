import { useStore } from '../state/store.ts'
import FlowHead from '../components/frame/FlowHead.tsx'
import DependantTiles from '../components/define/DependantTiles.tsx'
import DobField from '../components/define/DobField.tsx'
import MarriedField from '../components/define/MarriedField.tsx'
import PartnerBlock from '../components/define/PartnerBlock.tsx'
import PartnerTiles from '../components/define/PartnerTiles.tsx'
import { setFirstName } from '../components/define/aboutActions.ts'

/** The person icon inside the first-name box. */
const PERSON_ICON = (
  <svg
    className="in-ic"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
)

export const key = 'B1'
export const id = 'B1'
export const note =
  'Plan builder step 1 (layout v17): three glass sections (You · Partner · Family) with icon headers; partner as illustrated choice tiles; dependants as number tiles. Same fields and actions as before.'

export const Head = () =>
  FlowHead({
    eye: 'Step 1',
    title: 'About you & your family',
    sub: 'So we can suggest goals that fit your life stage.',
  })

export function Body() {
  const name = useStore((store) => store.plan.account.name)
  const withPartner = useStore((store) => store.plan.about.partner)
  const verified = useStore((store) => store.plan.account.emailVerified)

  return (
    <>
      <div className="card bcard">
        <div className="field">
          <label htmlFor="b-name">Your first name</label>
          <div className="inw icw">
            {PERSON_ICON}
            <input
              className="in"
              id="b-name"
              data-acct="name"
              autoComplete="given-name"
              placeholder="e.g. Aoife"
              defaultValue={name}
              onInput={(event) => setFirstName(event.currentTarget.value)}
            />
          </div>
        </div>
        <DobField who="you" />
      </div>
      <div className="card bcard">
        <div className="field" style={{ margin: 0 }}>
          <span className="flabel">Planning with a partner?</span>
          <PartnerTiles />
          {withPartner ? (
            <>
              <MarriedField />
              <PartnerBlock noMoney={!verified} />
            </>
          ) : null}
        </div>
      </div>
      <div className="card bcard">
        <span className="flabel" style={{ display: 'block', marginBottom: 8 }}>
          Children or others who rely on you
        </span>
        <DependantTiles />
      </div>
    </>
  )
}

export function Foot() {
  const ready = useStore(({ plan: { about } }) => {
    return (about.age ?? 0) >= 18 && about.partner != null && about.dependants != null
  })
  return (
    <>
      <p className="fnote">You can change these any time.</p>
      <button
        className="btn"
        data-a="go"
        data-p="F1"
        disabled={!ready}
        onClick={() => useStore.getState().go('F1')}
      >
        Next: your goals
      </button>
    </>
  )
}

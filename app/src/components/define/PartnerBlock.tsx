import { useStore } from '../../state/store.ts'
import GIcon from '../ui/GIcon.tsx'
import { setPartnerDetail, setPartnerIncome, setPartnerMode } from './aboutActions.ts'
import DobField from './DobField.tsx'
import PartnerInvite from './PartnerInvite.tsx'

const CHOICES = [
  {
    key: 'invite',
    emoji: '💌',
    title: 'Invite my partner',
    detail: 'They add their own details, privately',
  },
  // the manual tile's detail depends on whether income is asked
  { key: 'manual', emoji: '✍️', title: 'Add their details myself', detail: null },
] as const

/**
 * How to add the partner: invite them, or add their details yourself. Same state in Your finances
 * and the Me tab, so it is never asked twice. `noMoney` leaves out their income (before sign-in).
 */
export default function PartnerBlock({ noMoney = false }: { noMoney?: boolean }) {
  const mode = useStore((store) => store.plan.partner.mode)
  const name = useStore((store) => store.plan.partner.name)
  const income = useStore((store) => store.plan.figures.pIncome)
  const manualDetail = noMoney ? 'Name and age' : 'Name, age and income (optional)'

  return (
    <>
      <div className="pchoice" role="group" aria-label="How to add your partner">
        {CHOICES.map(({ key, emoji, title, detail }) => (
          <button
            key={key}
            className={mode === key ? 'ptile sel' : 'ptile'}
            aria-pressed={mode === key}
            data-a="pmode"
            data-p={key}
            onClick={() => setPartnerMode(key)}
          >
            <GIcon emoji={emoji} className="em" aria-hidden="true" />
            <b>{title}</b>
            <span className="small">{detail ?? manualDetail}</span>
          </button>
        ))}
      </div>
      {mode === 'invite' ? <PartnerInvite /> : null}
      {mode === 'manual' ? (
        <div style={{ marginTop: 12 }}>
          <div className="field">
            <label htmlFor="p-name">Their first name</label>
            <input
              className="in"
              id="p-name"
              data-partner="name"
              autoComplete="off"
              defaultValue={name}
              onInput={(event) => setPartnerDetail('name', event.currentTarget.value)}
            />
          </div>
          <DobField who="partner" />
          {noMoney ? (
            <p className="small" style={{ margin: 0 }}>
              You can add their income later, in Your finances.
            </p>
          ) : (
            <div className="field" style={{ margin: 0 }}>
              <label htmlFor="f-pIncome">
                Their gross yearly income{' '}
                <span className="small" style={{ fontWeight: 600 }}>
                  Optional
                </span>
              </label>
              <div className="inw">
                <span className="cur" aria-hidden="true">
                  €
                </span>
                <input
                  className="in eur"
                  id="f-pIncome"
                  inputMode="numeric"
                  data-fin="pIncome"
                  defaultValue={income == null ? '' : Math.round(income)}
                  onInput={(event) => setPartnerIncome(event.currentTarget.value)}
                />
              </div>
              <span className="small">Before tax. Leave it blank and we'll ask in Income.</span>
            </div>
          )}
        </div>
      ) : null}
      {mode ? null : (
        <p className="small" style={{ margin: '10px 0 0' }}>
          Pick one. You can change it later in <b>Me</b>.
        </p>
      )}
    </>
  )
}

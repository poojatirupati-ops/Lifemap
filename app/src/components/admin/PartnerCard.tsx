import { useSettings } from '../../state/settings.ts'

/** The partner's name, and a way back to LifeMap's own standards once anything is changed. */
export default function PartnerCard() {
  const partner = useSettings((store) => store.settings.partner)
  const anyChanged = useSettings((store) =>
    Object.values(store.settings.standards).some((standard) => standard.partnerValue != null),
  )
  const { setPartner, backToStandards } = useSettings.getState()

  return (
    <div className="card">
      <div className="field" style={{ margin: 0 }}>
        <label htmlFor="set-partner">
          Partner name (customers then read "Suggested by …" beside any figure you change)
        </label>
        <input
          key={partner}
          className="in"
          id="set-partner"
          defaultValue={partner}
          autoComplete="off"
          placeholder="e.g. a credit union"
          onBlur={(event) => setPartner(event.target.value)}
        />
      </div>
      {anyChanged || partner ? (
        <button className="link" style={{ marginTop: 8 }} onClick={backToStandards}>
          Back to the LifeMap standards
        </button>
      ) : null}
    </div>
  )
}

import { Fragment } from 'react'
import { fresh } from '../state/fresh.ts'
import { setDesk, signInForReview, startFrom, useShell } from '../state/shell.ts'
import { JUMPS, sampleCustomer } from './jumps.data.ts'
import { goTo } from './router.ts'
import type { Snapshot } from '../state/types.ts'

/** Start over from a plan and open a page; reviewer starts pass the sign-in wall. */
function startAt(snapshot: Snapshot, to: string, review = true) {
  if (review) signInForReview()
  startFrom(snapshot)
  void goTo(to)
}

export default function Side() {
  const screenId = useShell((shell) => shell.screenId)
  const screenNote = useShell((shell) => shell.screenNote)
  const desk = useShell((shell) => shell.desk)
  return (
    <aside className="side" aria-label="Prototype controls">
      <h1>
        <span className="mark"></span>LifeMap
      </h1>
      <p>
        <b>Clickable customer-journey prototype.</b> Sign in → 6 Discover questions → money
        personality → app (Home · Explore · My Plan · Me · Experts) → Make my plan (8 steps).
        Everything is simulated; no data leaves this page.
      </p>
      <button className="big" id="startnew" onClick={() => startAt(fresh(), '/', false)}>
        ▶ Start as a new customer
      </button>
      <button
        className="big alt"
        id="startsample"
        onClick={() => startAt(sampleCustomer(), '/plan')}
      >
        ⚡ Load sample customer → Results
      </button>
      <h4>View</h4>
      <div className="vtog" role="group" aria-label="View">
        <button id="vphone" aria-pressed={!desk} onClick={() => setDesk(false)}>
          📱 Phone
        </button>
        <button id="vdesk" aria-pressed={desk} onClick={() => setDesk(true)}>
          🖥️ Desktop
        </button>
      </div>
      <h4>Current screen</h4>
      <div id="curid">{screenId && `${screenId} · ${screenNote}`}</div>
      <h4>Jump to any screen</h4>
      <div id="jumps">
        {JUMPS.map(({ group, jumps }) => (
          <Fragment key={group}>
            <div className="grp">{group}</div>
            {jumps.map(({ id, label, to, build }) => (
              <button
                key={id}
                data-id={id}
                className={id === screenId ? 'on' : undefined}
                onClick={() => startAt(build(), to)}
              >
                <span className="jid">{id}</span>
                {label}
              </button>
            ))}
          </Fragment>
        ))}
      </div>
      <p style={{ marginTop: 16 }}>
        Prototype for demonstration. Figures are illustrative, not financial advice.
      </p>
      <p>
        Demo codes: <b>123456</b>.
      </p>
    </aside>
  )
}

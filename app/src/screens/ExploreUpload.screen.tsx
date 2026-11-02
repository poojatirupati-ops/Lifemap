import { useEffect } from 'react'
import { exploreBack } from '../state/explore.ts'
import StatementFigureRow from '../components/calc/StatementFigureRow.tsx'
import StatementTextRow from '../components/calc/StatementTextRow.tsx'
import { STATEMENT_KINDS } from '../domain/calc/statements.data.ts'
import { statePensionFromYears } from '../domain/calc/statementFills.ts'
import AppHead from '../components/frame/AppHead.tsx'
import { unseenLooks } from '../components/home/useHome.ts'
import Emo from '../components/ui/Emo.tsx'
import { LAW_TEXT, rulesFor } from '../domain/planning/rates.ts'
import { assumption } from '../domain/planning/assumptions.ts'
import { prsiYears } from '../domain/calc/statements.ts'
import { prefersReducedMotion } from '../hooks/reducedMotion.ts'
import { useStore } from '../state/store.ts'
import type { Plan } from '../state/types.ts'

export const key = 'PST'
export const id = (plan: Plan) => `PST-${plan.statement?.stage ?? 'scan'}`
export const note = (plan: Plan) => {
  const what = plan.statement ? STATEMENT_KINDS[plan.statement.cat].what : ''
  return plan.statement?.stage === 'confirm'
    ? `"We read these values, please confirm" (${what}): confidence tags, editable values, statement date + old flag. Optional values (charges, projection, holdings, valuation) apply only if shown. Feeds the tools and Your finances.`
    : `Reading your ${what} statement (mock document reader).`
}

// A call, not <AppHead />: the shell's splitHead pins the top bar by reading the returned tree.
// Head runs inside ScreenHost's render, which subscribes to the plan, so getState() is current.
export function Head() {
  const plan = useStore.getState().plan
  const confirming = plan.statement?.stage === 'confirm'
  return AppHead({
    title: confirming ? 'We read these values' : 'Reading your statement…',
    sub: confirming
      ? 'Please confirm. Change anything that looks wrong.'
      : plan.statement?.files.join(', '),
    back: exploreBack,
    needsLook: unseenLooks(plan),
  })
}

/** The (mock) reader takes a moment, then shows what it read. */
function Scanning({ what }: { what: string }) {
  const statementRead = useStore((store) => store.statementRead)
  useEffect(() => {
    const timer = setTimeout(statementRead, prefersReducedMotion() ? 200 : 1400)
    return () => clearTimeout(timer)
  }, [statementRead])
  return (
    <>
      <div className="scan" aria-hidden="true">
        📄
      </div>
      <p className="sub" style={{ textAlign: 'center', marginTop: 14 }} role="status">
        Finding your {what} figures
      </p>
    </>
  )
}

export function Body() {
  const upload = useStore((store) => store.plan.statement)
  const startYear = useStore((store) => assumption(store.plan, 'startYear'))
  if (!upload) return null
  const kind = STATEMENT_KINDS[upload.cat]
  if (upload.stage === 'scan') return <Scanning what={kind.what} />
  return (
    <>
      <div className="card">
        <b>
          <Emo>{`${kind.emoji} ${kind.title}`}</Emo>
        </b>
        <div className="small">{upload.files.join(', ')}</div>
        {kind.figures.map((figure) => (
          <StatementFigureRow key={figure.key} figure={figure} typed={upload.edit[figure.key]} />
        ))}
        {kind.texts?.map(({ label, text, confidence }) => (
          <StatementTextRow
            key={label}
            label={label}
            tag={<span className="tag doc">✓ {confidence}% sure</span>}
            value={text}
          />
        ))}
        <StatementTextRow
          label="Statement date"
          tag={kind.old ? <span className="tag est">Statement is over 12 months old</span> : null}
          value={kind.date}
        />
      </div>
      {kind.extra ? (
        <div className="card">
          <b>
            <Emo>{kind.extra.title}</Emo>
          </b>
          {kind.extra.figures.map((figure) => (
            <StatementFigureRow key={figure.key} figure={figure} typed={upload.edit[figure.key]} />
          ))}
          <div className="mini">
            <span>Expected State Pension</span>
            <b id="pst-sp">
              {statePensionFromYears(rulesFor(startYear), prsiYears(kind, upload.edit))}
            </b>
          </div>
          <p className="small" style={{ margin: '4px 0 0' }}>
            {LAW_TEXT.statePension} Check your record on MyWelfare.
          </p>
        </div>
      ) : null}
      <p className="disc">These also go into Your finances, so we won't ask for them again.</p>
    </>
  )
}

export function Foot() {
  const stage = useStore((store) => store.plan.statement?.stage)
  const confirmUpload = useStore((store) => store.confirmUpload)
  if (stage !== 'confirm') return null
  return (
    <>
      <button className="btn" data-a="pstok" onClick={confirmUpload}>
        Looks right, fill in my tools
      </button>
      <button className="btn ghost" data-a="xback" onClick={exploreBack}>
        Cancel
      </button>
    </>
  )
}

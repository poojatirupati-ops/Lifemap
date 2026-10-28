import { STATEMENTS } from '../components/explore/explore.data.ts'
import { exploreBack } from '../components/explore/exploreActions.ts'
import { calcContext } from '../components/calc/context.ts'
import { confirmUpload, uploadOf } from '../components/calc/statementActions.ts'
import StatementFigureRow from '../components/calc/StatementFigureRow.tsx'
import { STATEMENT_KINDS } from '../components/calc/statements.data.ts'
import { statePensionFromYears } from '../components/calc/statements.ts'
import AppHead from '../components/frame/AppHead.tsx'
import { unseenLooks } from '../components/home/useHome.ts'
import Emo from '../components/ui/Emo.tsx'
import { LAW_TEXT } from '../domain/planning/rates.ts'
import { useStore } from '../state/store.ts'
import type { Plan } from '../state/types.ts'

export const key = 'PST'
export const id = (plan: Plan) => `PST-${uploadOf(plan)?.stage ?? 'scan'}`
export const note = (plan: Plan) => {
  const upload = uploadOf(plan)
  const what = upload ? STATEMENTS[upload.cat as keyof typeof STATEMENTS]?.what : ''
  return upload?.stage === 'confirm'
    ? `"We read these values, please confirm" (${what}): confidence tags, editable values, statement date + old flag. Optional values (charges, projection, holdings, valuation) apply only if shown. Feeds the tools and Your finances.`
    : `Reading your ${what} statement (mock document reader).`
}

export function Head() {
  const plan = useStore.getState().plan
  const upload = uploadOf(plan)
  const confirming = upload?.stage === 'confirm'
  return AppHead({
    title: confirming ? 'We read these values' : 'Reading your statement…',
    sub: confirming
      ? 'Please confirm. Change anything that looks wrong.'
      : upload?.files.join(', '),
    back: exploreBack,
    needsLook: unseenLooks(plan),
  })
}

export function Body() {
  const upload = useStore((store) => uploadOf(store.plan))
  const rules = useStore((store) => calcContext(store.plan, 'retirement').rules)
  if (!upload) return null
  const kind = STATEMENT_KINDS[upload.cat]
  if (upload.stage === 'scan') {
    return (
      <>
        <div className="scan" aria-hidden="true">
          📄
        </div>
        <p className="sub" style={{ textAlign: 'center', marginTop: 14 }} role="status">
          Finding your {STATEMENTS[upload.cat as keyof typeof STATEMENTS]?.what} figures
        </p>
      </>
    )
  }
  const row = (figure: (typeof kind.figures)[number]) => (
    <StatementFigureRow key={figure[0]} figure={figure} typed={upload.edit[figure[0]]} />
  )
  return (
    <>
      <div className="card">
        <b>
          <Emo>{`${kind.emoji} ${kind.title}`}</Emo>
        </b>
        <div className="small">{upload.files.join(', ')}</div>
        {kind.figures.map(row)}
        {kind.texts?.map(([label, text, confidence]) => (
          <div key={label} className="mini">
            <span>
              <b style={{ fontSize: 14 }}>{label}</b>
              <br />
              <span className="tag doc">✓ {confidence}% sure</span>
            </span>
            <b>{text}</b>
          </div>
        ))}
        <div className="mini">
          <span>
            <b style={{ fontSize: 14 }}>Statement date</b>
            <br />
            {kind.old && <span className="tag est">Statement is over 12 months old</span>}
          </span>
          <b>{kind.date}</b>
        </div>
      </div>
      {kind.extra && (
        <div className="card">
          <b>
            <Emo>{kind.extra.title}</Emo>
          </b>
          {kind.extra.figures.map(row)}
          <div className="mini">
            <span>Expected State Pension</span>
            <b id="pst-sp">{statePensionFromYears(rules, +(upload.edit.prsi ?? 28) || 0)}</b>
          </div>
          <p className="small" style={{ margin: '4px 0 0' }}>
            {LAW_TEXT.statePension} Check your record on MyWelfare.
          </p>
        </div>
      )}
      <p className="disc">These also go into Your finances, so we won't ask for them again.</p>
    </>
  )
}

export function Foot() {
  const stage = useStore((store) => uploadOf(store.plan)?.stage)
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

import { createFileRoute, redirect } from '@tanstack/react-router'
import { useEffect } from 'react'
import { exploreBack } from '../../../../state/explore.ts'
import StatementFigureRow from '../../../../components/calc/StatementFigureRow.tsx'
import StatementTextRow from '../../../../components/calc/StatementTextRow.tsx'
import { EXAMPLE_FIGURES } from '../../../../components/finance/UploadReview.tsx'
import AppScreen from '../../../../components/frame/AppScreen.tsx'
import Emo from '../../../../components/ui/Emo.tsx'
import { LAW_TEXT, rulesFor } from '../../../../domain/planning/rates.ts'
import { assumption } from '../../../../domain/planning/assumptions.ts'
import {
  prsiYears,
  statePensionFromYears,
  statementKind,
} from '../../../../domain/calc/statements.ts'
import { isExample } from '../../../../domain/finances/upload.ts'
import { prefersReducedMotion } from '../../../../hooks/reducedMotion.ts'
import { useStore } from '../../../../state/store.ts'
import { useFigures } from '../../../../hooks/useFigures.ts'

// a statement being read or confirmed; without one (a reload) there is nothing to show here
export const Route = createFileRoute('/_auth/_app/explore/statement')({
  beforeLoad: () => {
    if (!useStore.getState().statement) throw redirect({ to: '/explore' })
  },
  component: ExploreUpload,
})

function ExploreUpload() {
  useFigures()
  const upload = useStore((store) => store.statement)
  const startYear = useStore((store) => assumption(store.plan, 'startYear'))
  const { statementRead, confirmUpload } = useStore.getState()
  const scanning = upload?.stage === 'scan'
  // the sample statement takes a moment to "read"; real uploads arrive already read
  useEffect(() => {
    if (!scanning) return
    const timer = setTimeout(statementRead, prefersReducedMotion() ? 200 : 1400)
    return () => clearTimeout(timer)
  }, [scanning, statementRead])
  if (!upload) return null
  const kind = statementKind(upload)

  return (
    <AppScreen
      id={`PST-${upload.stage}`}
      note={
        scanning
          ? `Reading your ${kind.what} statement (sample statement).`
          : `"We read these values, please confirm" (${kind.what}): confidence tags, editable values, statement date + old flag. Optional values (charges, projection, holdings, valuation) apply only if shown. Feeds the tools and Your finances.`
      }
      title={scanning ? 'Reading your statement…' : 'We read these values'}
      sub={scanning ? upload.files.join(', ') : 'Please confirm. Change anything that looks wrong.'}
      back={exploreBack}
      bell
      foot={
        scanning ? null : (
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
    >
      {scanning ? (
        <>
          <div className="scan" aria-hidden="true">
            📄
          </div>
          <p className="sub" style={{ textAlign: 'center', marginTop: 14 }} role="status">
            Finding your {kind.what} figures
          </p>
        </>
      ) : (
        <>
          <div className="card">
            <b>
              <Emo>{`${kind.emoji} ${kind.title}`}</Emo>
            </b>{' '}
            {isExample(upload.read) ? <span className="tag est">{EXAMPLE_FIGURES}</span> : null}
            <div className="small">{upload.files.join(', ')}</div>
            {kind.figures.map((figure) => (
              <StatementFigureRow
                key={figure.key}
                figure={figure}
                typed={upload.edit[figure.key]}
              />
            ))}
            {kind.texts?.map(({ label, text, confidence }) => (
              <StatementTextRow
                key={label}
                label={label}
                tag={<span className="tag doc">✓ {confidence}% sure</span>}
                value={text}
              />
            ))}
            {kind.date ? (
              <StatementTextRow
                label="Statement date"
                tag={
                  kind.old ? <span className="tag est">Statement is over 12 months old</span> : null
                }
                value={kind.date}
              />
            ) : null}
          </div>
          {kind.extra ? (
            <div className="card">
              <b>
                <Emo>{kind.extra.title}</Emo>
              </b>
              {kind.extra.figures.map((figure) => (
                <StatementFigureRow
                  key={figure.key}
                  figure={figure}
                  typed={upload.edit[figure.key]}
                />
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
      )}
    </AppScreen>
  )
}

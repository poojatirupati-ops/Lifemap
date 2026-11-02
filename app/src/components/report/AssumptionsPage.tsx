// Report page 10: what your plan assumes, its known limits and the words it uses.
import { PageFrame, TitleBlock, type PageProps } from './PageFrame.tsx'

/** Two columns of "Prices rise · 2% a year"; a long value takes its own line. */
function AssumedRows({ rows }: { rows: string[][] }) {
  return rows.map(([name, value]) => (
    <div className={value.length > 31 ? 'lmr-ar lg' : 'lmr-ar'} key={name}>
      <b className="lmx-k">{name}</b>
      <b className="lmx-v">{value}</b>
    </div>
  ))
}

export default function AssumptionsPage(props: PageProps) {
  const assumptions = props.data.assumptions
  const { left, right } = assumptions
  return (
    <PageFrame {...props} label="What your plan assumes">
      <div className="lmr-body">
        <TitleBlock
          {...assumptions}
          bigLabel="things we assumed"
          eyebrow="ASSUMPTIONS AND SMALL PRINT"
          title="What your plan assumes"
        />
        <div className={Math.max(left.length, right.length) > 6 ? 'lmr-as dense' : 'lmr-as'}>
          <div>
            <AssumedRows rows={left} />
          </div>
          <div>
            <AssumedRows rows={right} />
          </div>
        </div>
        <div className="lmr-two10">
          <div>
            <div className="lmr-h3">Known limits</div>
            <ul>
              {assumptions.knownLimits.items.map((limit) => (
                <li key={limit}>{limit}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="lmr-h3">Please note</div>
            <p>
              This is preliminary guidance, not financial advice. Only an authorised adviser can
              give advice. Investments can fall as well as rise. All projections are illustrative,
              not guaranteed. This tool is designed to help you explore your preferences. It does
              not replace a formal suitability or risk assessment where financial advice is
              provided.
            </p>
          </div>
        </div>
        <div className="lmr-src">
          Sources: Revenue; Department of Social Protection; CSO flash inflation September 2026; ECB
          target; LifeMap plan engine.
        </div>
        <div style={{ marginTop: 22 }} className="lmr-h3">
          Words used in this report
        </div>
        <div className="lmr-gl">
          {assumptions.glossary.items.map(([word, meaning]) => (
            <div key={word}>
              <b>{word}</b>
              <span>{meaning}</span>
            </div>
          ))}
        </div>
      </div>
    </PageFrame>
  )
}

// Report page 10: what your plan assumes, its known limits and the words it uses.
import AssumedRows from './AssumedRows.tsx'
import PageFrame, { type PageProps } from './PageFrame.tsx'
import TitleBlock from './TitleBlock.tsx'

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

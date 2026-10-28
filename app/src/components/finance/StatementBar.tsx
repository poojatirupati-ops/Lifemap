import Emo from '../ui/Emo.tsx'
import { removeSectionStatement, replaceSectionStatement } from './sectionActions.ts'

/** How many of the section's figures came from a statement, with Replace and Remove. */
export default function StatementBar({ count, index }: { count: number; index: number }) {
  return (
    <div className="card" id="docbar" style={{ background: 'var(--ok-l)', boxShadow: 'none' }}>
      <b>
        <Emo>{`📄 ${count} figure${count > 1 ? 's' : ''} from your statement`}</Emo>
      </b>
      <p className="small" style={{ margin: '4px 0 6px', color: 'var(--ink)' }}>
        Statement figures are used ahead of anything typed. To use your own figures instead, remove
        the statement.
      </p>
      <div className="row" style={{ gap: 16 }}>
        <button className="link" data-a="docrep" data-p={index} onClick={replaceSectionStatement}>
          Replace statement
        </button>
        <button className="link" data-a="docrem" data-p={index} onClick={removeSectionStatement}>
          Remove statement
        </button>
      </div>
    </div>
  )
}

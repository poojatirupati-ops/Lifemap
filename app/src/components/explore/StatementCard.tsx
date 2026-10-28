import { useStore } from '../../state/store.ts'
import Emo from '../ui/Emo.tsx'
import { STATEMENTS, withArticle } from './explore.data.ts'
import type { CategoryId } from './tools.data.ts'

// TODO(R-28): the upload flow (pstStart, pstRemove) lands with the statement uploads card.
const startUpload = (_category: CategoryId, _files?: string[]) => {}
const removeStatement = (_category: CategoryId) => {}

/** The upload card at the top of a calculator group whose tools a statement can fill in. */
export default function StatementCard({ category }: { category: CategoryId }) {
  const statement = STATEMENTS[category]!
  const uploaded = useStore((store) => store.plan.pdocs[category]) as
    { name: string; date: string } | undefined
  const verified = useStore((store) => store.plan.acct.ev)

  return (
    <div className="card pst">
      <b style={{ fontSize: 15 }}>
        <Emo>{`📄 Have ${withArticle(statement.what)} statement? Upload it and we'll fill in these tools for you.`}</Emo>
      </b>
      <p className="small" style={{ margin: '6px 0 10px' }}>
        We can read: {statement.reads.join(' · ')}.
      </p>
      {uploaded ? (
        <div className="mini" style={{ alignItems: 'center' }}>
          <span>
            <Emo>✅ Uploaded: </Emo>
            <b>
              {uploaded.name} · {uploaded.date}
            </b>
          </span>
          <span className="row" style={{ gap: 12 }}>
            <button
              className="link"
              data-a="pstup"
              data-p={category}
              onClick={() => startUpload(category)}
            >
              Replace statement
            </button>
            <button
              className="link"
              data-a="pstrem"
              data-p={category}
              onClick={() => removeStatement(category)}
            >
              Remove statement
            </button>
          </span>
        </div>
      ) : (
        <div className="grid2">
          <label className="btn sm" style={{ width: '100%', cursor: 'pointer' }}>
            Upload a statement
            <input
              type="file"
              className="sr"
              data-pfile={category}
              accept=".pdf,.jpg,.jpeg,.png,.heic"
              onChange={(event) =>
                startUpload(
                  category,
                  [...(event.target.files ?? [])].map((file) => file.name),
                )
              }
            />
          </label>
          <button
            className="btn sm ghost"
            style={{ width: '100%' }}
            data-a="pstup"
            data-p={category}
            onClick={() => startUpload(category)}
          >
            Use a sample statement
          </button>
        </div>
      )}
      {!verified && (
        <p className="small" style={{ margin: '8px 0 0' }}>
          🔐 First we'll secure your account (email and mobile code), so your documents stay
          private.
        </p>
      )}
    </div>
  )
}

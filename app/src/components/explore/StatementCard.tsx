import { useDocumentUpload } from '../../documents/documents.ts'
import { useStore } from '../../state/store.ts'
import Emo from '../ui/Emo.tsx'
import { withArticle, type Statement } from './explore.data.ts'
import type { CategoryId } from './tools.data.ts'

/** The upload card at the top of a calculator group whose tools a statement can fill in. */
export default function StatementCard({
  category,
  statement,
}: {
  category: CategoryId
  statement: Statement
}) {
  const uploaded = useStore((store) => store.plan.statements[category])
  const verified = useStore((store) => store.plan.account.emailVerified)
  const { startStatement, removeUploadedStatement } = useStore.getState()
  const { on, pending, upload } = useDocumentUpload(category)

  return (
    <div className="card pst">
      <b style={{ fontSize: 15 }}>
        <Emo>{`📄 Have ${withArticle(statement.what)} statement? Upload it and we'll fill in these tools for you.`}</Emo>
      </b>
      <p className="small" style={{ margin: '6px 0 10px' }}>
        We can read: {statement.reads}.
      </p>
      {uploaded ? (
        <div className="mini" style={{ alignItems: 'center' }}>
          <span>
            <Emo>✅ Uploaded: </Emo>
            <b>
              {uploaded.name}
              {uploaded.date ? ` · ${uploaded.date}` : null}
            </b>
          </span>
          <span className="row" style={{ gap: 12 }}>
            <button
              className="link"
              data-a="pstup"
              data-p={category}
              onClick={() => startStatement(category)}
            >
              Replace statement
            </button>
            <button
              className="link"
              data-a="pstrem"
              data-p={category}
              onClick={() => removeUploadedStatement(category)}
            >
              Remove statement
            </button>
          </span>
        </div>
      ) : (
        <div className="grid2">
          {on ? (
            <label
              className="btn sm"
              style={{ width: '100%', cursor: 'pointer' }}
              aria-disabled={pending}
            >
              {pending ? 'Reading…' : 'Upload a statement'}
              <input
                type="file"
                className="sr"
                data-pfile={category}
                accept=".pdf,.jpg,.jpeg,.png,.heic"
                disabled={pending}
                onChange={(event) => {
                  // Documents need a secured account first: startStatement shows the gate, then reads the sample.
                  if (useStore.getState().plan.account.emailVerified)
                    upload(event.currentTarget, (files, read) =>
                      startStatement(category, files, read),
                    )
                  else startStatement(category)
                }}
              />
            </label>
          ) : null}
          <button
            className="btn sm ghost"
            style={{ width: '100%' }}
            data-a="pstup"
            data-p={category}
            onClick={() => startStatement(category)}
          >
            Use a sample statement
          </button>
        </div>
      )}
      {verified ? null : (
        <p className="small" style={{ margin: '8px 0 0' }}>
          🔐 First we'll secure your account (email code), so your documents stay private.
        </p>
      )}
    </div>
  )
}

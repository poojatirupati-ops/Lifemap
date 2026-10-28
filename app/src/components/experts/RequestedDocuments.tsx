import { toast } from '../../state/shell.ts'

const DOCUMENTS = ['Latest pension statement', 'Mortgage statement (last 12 months)']

/** After booking: the documents the adviser asked for, each with an upload link. */
export default function RequestedDocuments({ adviserFirstName }: { adviserFirstName: string }) {
  return (
    <div className="card">
      <b>Documents your adviser asked for</b>
      {DOCUMENTS.map((document) => (
        <div className="mini" key={document}>
          <span>📄 {document}</span>
          <button className="link" onClick={() => toast(`Sent securely to ${adviserFirstName}`)}>
            Upload
          </button>
        </div>
      ))}
    </div>
  )
}

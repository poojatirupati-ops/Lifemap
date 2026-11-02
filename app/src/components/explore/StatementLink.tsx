import { useStore } from '../../state/store.ts'
import Emo from '../ui/Emo.tsx'
import { withArticle, type Statement } from './explore.data.ts'
import { openCategory } from '../../state/explore.ts'
import type { CategoryId } from './tools.data.ts'

/** On a topic page: the way to the statement upload card, or to the uploaded statement. */
export default function StatementLink({
  category,
  statement,
}: {
  category: CategoryId
  statement: Statement
}) {
  const uploaded = useStore((store) => category in store.plan.statements)
  const text = uploaded
    ? `Your ${statement.what} statement is uploaded · see it`
    : `Upload ${withArticle(statement.what)} statement to fill in these tools`
  return (
    <button
      className="link"
      style={{ fontSize: 15, display: 'block' }}
      onClick={() => openCategory(category)}
      data-a="cat"
      data-p={category}
    >
      <Emo>{`📄 ${text} →`}</Emo>
    </button>
  )
}

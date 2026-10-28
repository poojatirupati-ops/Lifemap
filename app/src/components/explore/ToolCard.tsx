import { categoryById, toolById } from './tools.data.ts'
import { openCalculator } from './exploreActions.ts'

/** A product-style card for one calculator, in a horizontal strip. */
export default function ToolCard({ id }: { id: string }) {
  const tool = toolById(id)
  const category = categoryById(tool.category)
  return (
    <div className="pcard">
      <span className="pc-top" style={{ background: category.color }} aria-hidden="true">
        {tool.emoji}
      </span>
      <span className="pc-cat">{category.name}</span>
      <b>{tool.name}</b>
      <button
        className="btn sm pc-go"
        aria-label={`Try ${tool.name}`}
        data-a="calc"
        data-p={id}
        onClick={() => openCalculator(id)}
      >
        Try it <span aria-hidden="true">→</span>
      </button>
    </div>
  )
}

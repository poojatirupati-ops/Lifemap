import { openCalculator } from '../../state/explore.ts'
import ExploreRow from './ExploreRow.tsx'
import type { Tool } from './tools.data.ts'

/** A list row that opens one calculator. */
export default function CalculatorRow({ tool }: { tool: Tool }) {
  return (
    <ExploreRow
      emoji={tool.emoji}
      title={tool.name}
      sub={tool.question}
      onClick={() => openCalculator(tool.id)}
      data-a="calc"
      data-p={tool.id}
    />
  )
}

import { openCalculator } from '../../state/explore.ts'
import { toolById } from '../explore/tools.data.ts'
import GIcon from '../ui/GIcon.tsx'

/** One calculator as a service tile in Home's "Tools to try". */
export default function ToolButton({ id }: { id: string }) {
  const tool = toolById(id)
  return (
    <button className="sv2" data-a="calc" data-p={id} onClick={() => openCalculator(id)}>
      <GIcon emoji={tool.emoji} className="sv2-i" aria-hidden="true" />
      <span className="sv2-t">
        <b>{tool.name}</b>
        <small>{tool.question}</small>
      </span>
      <span className="sv2-go" aria-hidden="true">
        →
      </span>
    </button>
  )
}

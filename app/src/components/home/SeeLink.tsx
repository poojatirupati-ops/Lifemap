import { useStore } from '../../state/store.ts'
import type { PlanSection } from '../../state/types.ts'

type Props = { section: PlanSection; children: string }

/** A text link that opens one section of My Plan. */
export default function SeeLink({ section, children }: Props) {
  const showSection = useStore((store) => store.showSection)
  return (
    <button className="link" data-a="seg" data-p={section} onClick={() => showSection(section)}>
      {children}
    </button>
  )
}

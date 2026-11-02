import { useStore } from '../../state/store.ts'
import ToolButton from './ToolButton.tsx'

/** "Tools to try": the calculators picked for the customer, with a link to Explore. */
export default function ToolList({ ids }: { ids: string[] }) {
  const switchTab = useStore((store) => store.switchTab)
  return (
    <>
      <div className="sec">
        <h3>Tools to try</h3>
        <button className="link" data-a="tab" data-p="explore" onClick={() => switchTab('explore')}>
          Explore
        </button>
      </div>
      <div className="svc2">
        {ids.map((id) => (
          <ToolButton key={id} id={id} />
        ))}
      </div>
    </>
  )
}

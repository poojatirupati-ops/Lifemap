import { useStore } from '../../state/store.ts'

/** "Adjust for inflation": show the result in today's money. */
export default function InflationSwitch({ toolId, on }: { toolId: string; on: boolean }) {
  const toggleTodaysMoney = useStore((store) => store.toggleTodaysMoney)
  return (
    <div className="adjrow">
      <button
        className={on ? 'chip sm sel' : 'chip sm'}
        role="switch"
        aria-checked={on}
        data-a="adjinfl"
        data-p={toolId}
        onClick={() => toggleTodaysMoney(toolId)}
      >
        {on ? '✓ ' : ''}Adjust for inflation
      </button>
      <span className="small">Show the result in today's money</span>
    </div>
  )
}

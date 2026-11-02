import { useStore } from '../../state/store.ts'
import { useFeature } from '../../shell/tenant.ts'

/** The "Ask Life Map" bar: opens the Ask sheet. */
export default function AskBar() {
  const openAsk = useStore((store) => store.openAsk)
  if (!useFeature('ask')) return null
  return (
    <button className="askbar" data-a="ask" onClick={openAsk}>
      <span className="ab-spark" aria-hidden="true">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth="1.8"
          strokeLinejoin="round"
        >
          <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
          <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" />
        </svg>
      </span>
      <span className="ab-tx">
        Ask <b>Life Map</b> about your money…
      </span>
      <span className="ab-mic" aria-hidden="true">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <rect x="9" y="3" width="6" height="11" rx="3" />
          <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
        </svg>
      </span>
    </button>
  )
}

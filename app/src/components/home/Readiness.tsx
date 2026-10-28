const ARC = Math.PI * 80 // half circle, radius 80

type Props = { percent: number; onTrack: number; goals: number; rough: boolean }

/** Overall readiness: the average covered percent on a half-circle gauge. */
export default function Readiness({ percent, onTrack, goals, rough }: Props) {
  const filled = (ARC * Math.max(0, Math.min(100, percent))) / 100
  return (
    <div className="card gcard">
      <div className="eyebrow">Overall readiness{rough ? ' · rough' : ''}</div>
      <div className="gauge" aria-hidden="true">
        <svg viewBox="0 0 200 112" width="220" height="123">
          <defs>
            <linearGradient id="gg" x1="0" x2="1">
              <stop offset="0" stopColor="#22D3EE" />
              <stop offset="1" stopColor="#2563EB" />
            </linearGradient>
          </defs>
          <path
            d="M20 100 A80 80 0 0 1 180 100"
            fill="none"
            stroke="rgba(15,47,74,.08)"
            strokeWidth="18"
            strokeLinecap="round"
          />
          <path
            d="M20 100 A80 80 0 0 1 180 100"
            fill="none"
            stroke="url(#gg)"
            strokeWidth="18"
            strokeLinecap="round"
            strokeDasharray={`${filled.toFixed(1)} ${ARC.toFixed(1)}`}
          />
        </svg>
        <b>
          {percent}
          <small>%</small>
        </b>
      </div>
      <b className="gk">{`${onTrack} of ${goals} goals on track`}</b>
      <div className="small">How much of your goals your money can cover, on average.</div>
    </div>
  )
}

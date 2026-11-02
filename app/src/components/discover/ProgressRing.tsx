const RADIUS = 52
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const gradient = (
  <defs>
    <linearGradient id="dng" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#08D9B8" />
      <stop offset="1" stopColor="#0B5880" />
    </linearGradient>
  </defs>
)

interface Props {
  count: number
  total: number
  /** where the dot sits on the ring: the count that unlocks the result */
  marker: number
}

/** A ring filled by count of total, with a dot at the marker and the count in the middle. */
export default function ProgressRing({ count, total, marker }: Props) {
  const markerAngle = (2 * Math.PI * marker) / total
  return (
    <div className="dn-ring" aria-hidden="true">
      <svg width="132" height="132" viewBox="0 0 132 132">
        {gradient}
        <circle
          cx="66"
          cy="66"
          r={RADIUS}
          fill="none"
          stroke="rgba(8,106,116,.1)"
          strokeWidth="10"
        />
        <circle
          cx="66"
          cy="66"
          r={RADIUS}
          fill="none"
          stroke="url(#dng)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - count / total)}
          transform="rotate(-90 66 66)"
          className="dn-arc"
        />
        <circle
          cx={66 + RADIUS * Math.sin(markerAngle)}
          cy={66 - RADIUS * Math.cos(markerAngle)}
          r="5"
          fill="#fff"
          stroke="#079E98"
          strokeWidth="2.5"
        />
      </svg>
      <span>
        <b>
          {count}
          <small>/{total}</small>
        </b>
        <em>answered</em>
      </span>
    </div>
  )
}

import { clampPercent } from './tones.ts'

interface GoalBarProps {
  label: string
  value: string
  percent: number
  colour: string
}

/** "Retirement costs  about €1.2m" over a filled track. */
export default function GoalBar({ label, value, percent, colour }: GoalBarProps) {
  return (
    <div className="lmr-bar">
      <div className="lmx-t">
        <span>{label}</span>
        <b>{value}</b>
      </div>
      <div className="lmr-track">
        <div
          className="lmr-fill"
          style={{ width: `${clampPercent(percent)}%`, background: colour }}
        ></div>
      </div>
    </div>
  )
}

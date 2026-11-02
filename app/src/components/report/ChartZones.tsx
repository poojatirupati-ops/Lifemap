// The chart's background bands (working, on savings, a gap) and their labels.
import { CHART, BOLD, type Zone } from './chart.ts'
import { COLOURS, textOf } from './tones.ts'

const ZONE_COLOURS: Record<string, string> = {
  good: COLOURS.tealTint2,
  gold: '#f8f3e3',
  coral: '#f7ece9',
}
const TOP = CHART.top - 3
const LABEL_Y = 18

export default function ChartZones({ zones, x }: { zones: Zone[]; x: (age: number) => number }) {
  return (
    <>
      {zones.map((zone) => (
        <rect
          key={`band ${zone.fromAge}`}
          x={x(zone.fromAge).toFixed(1)}
          y={TOP}
          width={Math.max(0, x(zone.toAge) - x(zone.fromAge)).toFixed(1)}
          height={CHART.bottom - TOP}
          fill={ZONE_COLOURS[zone.tone] ?? '#eee'}
        />
      ))}
      {zones.map((zone) =>
        zone.label ? (
          <text
            key={`label ${zone.fromAge}`}
            x={((x(zone.fromAge) + x(zone.toAge)) / 2).toFixed(1)}
            y={LABEL_Y}
            textAnchor="middle"
            {...BOLD}
            fontSize="12"
            letterSpacing="1.4"
            fill={textOf(zone.tone)}
          >
            {zone.label}
          </text>
        ) : null,
      )}
    </>
  )
}

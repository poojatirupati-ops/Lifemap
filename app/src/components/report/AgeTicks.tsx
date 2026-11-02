// Every decade's age along the bottom of a chart.
import { CHART, TEXT } from './chart.ts'
import { COLOURS } from './tones.ts'

interface AgeTicksProps {
  fromAge: number
  toAge: number
  x: (age: number) => number
}

export default function AgeTicks({ fromAge, toAge, x }: AgeTicksProps) {
  const decades = []
  for (let age = Math.ceil(fromAge / 10) * 10; age <= toAge; age += 10) decades.push(age)
  return decades.map((age) => (
    <text
      key={age}
      x={x(age).toFixed(1)}
      y={CHART.bottom + 23}
      textAnchor="middle"
      {...TEXT}
      fontSize="12.5"
      fill={COLOURS.muted}
    >
      {age}
    </text>
  ))
}

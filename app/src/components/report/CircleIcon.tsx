import Icon from './Icon.tsx'
import { textOf, tintOf } from './tones.ts'

interface CircleIconProps {
  name: string
  tone?: string
  size?: number
  /** The icon's own size; half the circle by default. */
  iconSize?: number
}

/** A line icon on a round tint of its tone. */
export default function CircleIcon({ name, tone, size = 44, iconSize }: CircleIconProps) {
  return (
    <span
      className="lmr-circ"
      style={{ width: size, height: size, background: tintOf(tone), color: textOf(tone) }}
    >
      <Icon name={name} size={iconSize ?? Math.round(size * 0.5)} />
    </span>
  )
}

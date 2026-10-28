import type { HTMLAttributes } from 'react'
import { GOAL_ICONS } from './icons.data.ts'
import Svg from './Svg.tsx'

const withoutVariation = (emoji: string) => emoji.trim().replace(/\uFE0F/g, '')

const goalIconFor = (emoji: string) =>
  Object.entries(GOAL_ICONS).find(([key]) => withoutVariation(key) === withoutVariation(emoji))?.[1]

type Props = { emoji: string } & HTMLAttributes<HTMLSpanElement>

/**
 * An icon tile (.e, .ic, .em, ...) for a goal emoji: a known goal shows its teal line icon and the
 * tile gets .gix; any other emoji shows `children`, or the emoji itself.
 */
export default function GIcon({ emoji, className, children, ...rest }: Props) {
  const icon = goalIconFor(emoji)
  return (
    <span className={icon ? `${className} gix` : className} {...rest}>
      {icon ? <Svg src={icon} /> : (children ?? emoji)}
    </span>
  )
}

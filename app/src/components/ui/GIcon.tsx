import type { HTMLAttributes } from 'react'
import { clsx } from 'clsx'
import { GOAL_ICONS } from './icons.tsx'

const withoutVariation = (emoji: string) => emoji.trim().replace(/\uFE0F/g, '')

const ICON_BY_EMOJI = new Map(
  Object.entries(GOAL_ICONS).map(([emoji, icon]) => [withoutVariation(emoji), icon]),
)

type Props = { emoji: string } & HTMLAttributes<HTMLSpanElement>

/**
 * An icon tile (.e, .ic, .em, ...) for a goal emoji: a known goal shows its teal line icon and the
 * tile gets .gix; any other emoji shows `children`, or the emoji itself.
 */
export default function GIcon({ emoji, className, children, ...rest }: Props) {
  const icon = ICON_BY_EMOJI.get(withoutVariation(emoji))
  return (
    <span className={clsx(className, icon && 'gix') || undefined} {...rest}>
      {icon ?? children ?? emoji}
    </span>
  )
}

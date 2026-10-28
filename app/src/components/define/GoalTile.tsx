import type { CSSProperties } from 'react'
import { goalCategory } from '../../domain/discovery/goals.data.ts'
import { useStore } from '../../state/store.ts'
import GIcon from '../ui/GIcon.tsx'
import { hasNoMortgage, toggleGoal } from './goalActions.ts'

/** The photo behind each goal tile; any other goal shows the everyday photo. */
const PHOTOS: Record<string, string> = {
  home: 'art-mortgage',
  mfree: 'art-mortgage',
  retire: 'art-pension',
  legacy: 'art-pension',
  wealth: 'art-investing',
  edu: 'art-edu',
  business: 'art-investing',
  safety: 'art-rain',
  family: 'art-family',
  helpfam: 'art-protection',
  wedding: 'art-wedding',
  travel: 'art-travel',
  car: 'art-car',
  health: 'art-protection',
}

/** A goal photo tile: teal border, fill and tick when picked. */
export default function GoalTile({ goalKey }: { goalKey: string }) {
  const picked = useStore((store) => store.plan.goals.some((goal) => goal.k === goalKey))
  const noMortgage = useStore((store) => hasNoMortgage(store.plan.fin.home))
  const category = goalCategory(goalKey)!
  const isOther = goalKey === 'other'
  const unavailable = goalKey === 'mfree' && noMortgage && !picked
  const className = ['gtile gph', picked && 'sel', unavailable && 'off', isOther && 'noimg']
    .filter(Boolean)
    .join(' ')
  const photo = { '--gimg': `var(--${PHOTOS[goalKey] ?? 'art-everyday'})` } as CSSProperties

  return (
    <button
      className={className}
      aria-pressed={picked}
      data-a="gpick"
      data-p={goalKey}
      aria-disabled={unavailable || undefined}
      title={unavailable ? 'Only if you have a mortgage' : undefined}
      style={isOther ? undefined : photo}
      onClick={() => toggleGoal(goalKey)}
    >
      <span className="gt-img" aria-hidden="true"></span>
      <span className="tick" aria-hidden="true">
        ✓
      </span>
      <GIcon emoji={category.emoji} className="em" aria-hidden="true" />
      <span className="nm">
        {category.title}
        {goalKey === 'mfree' && (
          <small className="ghint">
            {unavailable ? 'Only if you have a mortgage' : 'Homeowners with a mortgage'}
          </small>
        )}
      </span>
    </button>
  )
}

import { DEPENDANT_CHOICES } from '../../domain/identity/household.data.ts'
import { useStore } from '../../state/store.ts'
import { setDependants } from '../../state/about.ts'

// index = the number stored in about.deps (3 means three or more), as DEPENDANT_CHOICES
const TILES = [
  { words: 'none', under: 'None' },
  { words: 'one', under: 'person' },
  { words: 'two', under: 'people' },
  { words: 'three or more', under: 'or more' },
]

/** Children or others who rely on you, as number tiles. */
export default function DependantTiles() {
  const dependants = useStore((store) => store.plan.about.dependants)

  return (
    <div className="bdeps" role="group" aria-label="Children or others who rely on you">
      {TILES.map(({ words, under }, count) => (
        <button
          key={count}
          className={dependants === count ? 'bdep on' : 'bdep'}
          aria-pressed={dependants === count}
          aria-label={words}
          data-a="deps"
          data-p={count}
          onClick={() => setDependants(count)}
        >
          <b>{DEPENDANT_CHOICES[count]}</b>
          <small>{under}</small>
        </button>
      ))}
    </div>
  )
}

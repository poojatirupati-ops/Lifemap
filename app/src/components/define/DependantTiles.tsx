import { useStore } from '../../state/store.ts'
import { setDependants } from './aboutActions.ts'

// index = the number stored in about.deps (3 means three or more)
const TILES = [
  { number: '0', words: 'none', under: 'None' },
  { number: '1', words: 'one', under: 'person' },
  { number: '2', words: 'two', under: 'people' },
  { number: '3+', words: 'three or more', under: 'or more' },
]

/** Children or others who rely on you, as number tiles. */
export default function DependantTiles() {
  const dependants = useStore((store) => store.plan.about.deps)

  return (
    <div className="bdeps" role="group" aria-label="Children or others who rely on you">
      {TILES.map(({ number, words, under }, count) => (
        <button
          key={number}
          className={dependants === count ? 'bdep on' : 'bdep'}
          aria-pressed={dependants === count}
          aria-label={words}
          data-a="deps"
          data-p={count}
          onClick={() => setDependants(count)}
        >
          <b>{number}</b>
          <small>{under}</small>
        </button>
      ))}
    </div>
  )
}

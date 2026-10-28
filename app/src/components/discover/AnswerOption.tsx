import type { Option } from '../../domain/discovery/questions.data.ts'
import Svg from '../ui/Svg.tsx'
import { ROAD_ART } from './roadArt.data.ts'

const TILE_COLOURS = ['var(--sun-l)', 'var(--sky-l)', 'var(--sea-l)', 'var(--storm-l)', '#FDE3DC']

interface Props {
  option: Option
  index: number
  selected: boolean
  /** one answer per row, for long answers */
  wide: boolean
  /** a road card: road picture and the road's line */
  road: boolean
  onPick: () => void
}

export default function AnswerOption({ option, index, selected, wide, road, onPick }: Props) {
  const className = ['opt', wide && 'row1', selected && 'sel'].filter(Boolean).join(' ')
  return (
    <button
      className={className}
      aria-pressed={selected}
      data-a="dpick"
      data-p={index}
      onClick={onPick}
    >
      {road ? (
        <span className="em road" aria-hidden="true">
          <Svg src={ROAD_ART[index]} />
        </span>
      ) : (
        <span
          className="em"
          style={{ background: TILE_COLOURS[index % TILE_COLOURS.length] }}
          aria-hidden="true"
        >
          {option.emoji}
        </span>
      )}
      <span className="tx">{option.text}</span>
      <span className="otag">◆ {option.tag}</span>
      {road && (
        <svg
          width="100%"
          height="30"
          viewBox="0 0 140 50"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d={option.path}
            fill="none"
            stroke="var(--sea-d)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      )}
    </button>
  )
}

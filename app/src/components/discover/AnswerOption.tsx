import clsx from 'clsx'
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
  onPick: () => void
}

/** One answer card; a road answer (one with a path) shows its road picture and line. */
export default function AnswerOption({ option, index, selected, wide, onPick }: Props) {
  return (
    <button
      className={clsx('opt', { row1: wide, sel: selected })}
      aria-pressed={selected}
      onClick={onPick}
    >
      {option.path ? (
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
      {option.path ? (
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
      ) : null}
    </button>
  )
}

import clsx from 'clsx'
import type { Option } from '../../domain/discovery/questions.data.ts'

// The road pictures on the risk-appetite answers (Q8), as in the original: each one's markup inside a 56x56 <svg>.
const ROAD_ART = [
  '<rect width="56" height="56" rx="16" fill="#E3F2F5"/><circle cx="43" cy="14" r="5" fill="#7DEBD8"/><path d="M0 34h56v22H0z" fill="#BFE3D6"/><path d="M22 34h12l10 22H12z" fill="#5B6B76"/><path d="M28 36v3M28 42v4M28 49v5" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>',
  '<rect width="56" height="56" rx="16" fill="#E3F2F5"/><path d="M0 32c12-6 24-6 36-2s16 2 20 0v26H0z" fill="#A9DCCB"/><path d="M30 56c-6-6 10-10 2-16s-6-8 0-10" fill="none" stroke="#6E7D86" stroke-width="5" stroke-linecap="round"/><path d="M30 56c-6-6 10-10 2-16s-6-8 0-10" fill="none" stroke="#fff" stroke-width="1" stroke-dasharray="2 3"/><circle cx="12" cy="30" r="6" fill="#2A7F8C"/><path d="M12 36v5" stroke="#1E3D47" stroke-width="2"/><circle cx="46" cy="30" r="5" fill="#3A8C99"/><path d="M46 35v4" stroke="#1E3D47" stroke-width="2"/>',
  '<rect width="56" height="56" rx="16" fill="#EAFBF7"/><path d="M0 30c8-8 16-8 24 0s16 8 32-2v28H0z" fill="#9ED6C4"/><path d="M0 40c10-6 18-4 28 0s18 4 28-2v18H0z" fill="#6DBFA8"/><path d="M8 56c4-6 14-4 10-12s10-6 14-12 10-4 14-8" fill="none" stroke="#6E7D86" stroke-width="3.5" stroke-linecap="round"/><g fill="#B8C4CA"><circle cx="20" cy="49" r="1.4"/><circle cx="24" cy="47" r="1.4"/><circle cx="35" cy="38" r="1.4"/><circle cx="39" cy="35" r="1.4"/></g><circle cx="44" cy="13" r="4" fill="#08D9B8"/>',
  '<rect width="56" height="56" rx="16" fill="#E8EEF4"/><path d="M0 50L16 18l10 14 8-20 22 38z" fill="#4A7F8C"/><path d="M16 18l4 8-4-2-3 4zM34 12l5 10-5-3-4 4z" fill="#fff"/><path d="M0 56V48l56 4v4z" fill="#8FC9B6"/><path d="M14 54l18-4-16-4 18-4-14-4 12-4" fill="none" stroke="#08D9B8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
]

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
          <svg
            viewBox="0 0 56 56"
            width="56"
            height="56"
            dangerouslySetInnerHTML={{ __html: ROAD_ART[index] }}
          />
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

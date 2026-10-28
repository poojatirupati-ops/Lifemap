import type { Option } from '../../domain/discovery/questions.data.ts'
import GIcon from '../ui/GIcon.tsx'

interface Props {
  option: Option
  selected: boolean
  /** the umpick data-p: edit key | option index */
  code: string
  withTag?: boolean
  onPick: () => void
}

/** One answer of a money-profile question, a full-width row. */
export default function ProfileOption({ option, selected, code, withTag, onPick }: Props) {
  return (
    <button
      className={selected ? 'opt row1 sel' : 'opt row1'}
      aria-pressed={selected}
      data-a="umpick"
      data-p={code}
      onClick={onPick}
    >
      <GIcon
        emoji={option.emoji}
        className="em"
        style={{ background: 'var(--sand)' }}
        aria-hidden="true"
      />
      <span className="tx">
        {option.text}
        {withTag && option.tag && (
          <>
            <br />
            <span className="otag" style={{ display: 'inline-block', marginTop: 4 }}>
              ◆ {option.tag}
            </span>
          </>
        )}
      </span>
    </button>
  )
}

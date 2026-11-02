import { useStore } from '../../state/store.ts'

/** One line of My details; tapping it opens About you to change it. Empty shows Add. */
export default function DetailRow({
  emoji,
  label,
  value,
}: {
  emoji: string
  label: string
  value: string
}) {
  return (
    <button
      className="pd-r"
      data-a="fsec"
      data-p="0"
      onClick={() => useStore.getState().openSection(0)}
    >
      <span className="pd-i" aria-hidden="true">
        {emoji}
      </span>
      <span className="pd-l">{label}</span>
      {value !== '' ? <b>{value}</b> : <em>Add</em>}
      <span className="pd-c" aria-hidden="true">
        ›
      </span>
    </button>
  )
}

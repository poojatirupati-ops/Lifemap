import type { Provenance } from '../../state/types.ts'
import Emo from '../ui/Emo.tsx'

const TAGS: Record<Provenance | 'none', [className: string, text: string]> = {
  doc: ['tag doc', '✅ From document'],
  typed: ['tag typed', '✏️ Your figure'],
  pre: ['tag pre', '✏️ Your figure · from your answers'],
  none: ['tag none', '❓ Missing'],
}

/**
 * Where a figure came from.
 * TODO(R-19): the finance fields' tag also shows "Needs a look" and the reading confidence;
 * use theirs then.
 */
export default function SourceTag({ source }: { source?: Provenance }) {
  const [className, text] = TAGS[source ?? 'none']
  return (
    <span className={className}>
      <Emo>{text}</Emo>
    </span>
  )
}

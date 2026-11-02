import type { Provenance } from '../../state/types.ts'

const TAGS = {
  look: ['tag look', '⚠️ Needs a look'],
  typed: ['tag typed', '✏️ Your figure'],
  pre: ['tag pre', '✏️ Your figure · from your answers'],
  none: ['tag none', '❓ Missing'],
}

interface TagInput {
  source?: Provenance
  confidence?: number
  corrected?: boolean
  look?: boolean
}

/** Where a figure came from, or that it needs a look: [className, text]. */
export function tagFor({ source, confidence, corrected, look }: TagInput) {
  if (look) return TAGS.look
  if (source !== 'doc') return TAGS[source ?? 'none']
  if (corrected) return ['tag doc', '✅ From your statement (corrected)']
  return ['tag doc', `✅ From document${confidence ? ` · ${confidence}%` : ''}`]
}

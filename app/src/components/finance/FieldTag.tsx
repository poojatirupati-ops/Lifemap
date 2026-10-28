import { useShallow } from 'zustand/react/shallow'
import { useStore } from '../../state/store.ts'
import Emo from '../ui/Emo.tsx'

const TAGS = {
  look: ['tag look', '⚠️ Needs a look'],
  typed: ['tag typed', '✏️ Your figure'],
  pre: ['tag pre', '✏️ Your figure · from your answers'],
  none: ['tag none', '❓ Missing'],
}

/** Where a finance figure came from, or that it needs a look. */
export default function FieldTag({ field }: { field: string }) {
  const [className, text] = useStore(
    useShallow(({ plan }) => {
      const ownsHome = /^Own/.test(plan.fin.home || '')
      const source = field === 'mortYN' ? plan.src[ownsHome ? 'home' : 'mortYN'] : plan.src[field]
      if (plan.look[field] && !plan.ack[field]) return TAGS.look
      if (source !== 'doc') return TAGS[source ?? 'none']
      const confidence = plan.conf[field] ? ` · ${plan.conf[field]}%` : ''
      const read = plan.fix[field]
        ? 'From your statement (corrected)'
        : `From document${confidence}`
      return ['tag doc', `✅ ${read}`]
    }),
  )
  return (
    <span className={className}>
      <Emo>{text}</Emo>
    </span>
  )
}

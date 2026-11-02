import type { ReactNode } from 'react'
import HdrBar from './HdrBar.tsx'
import TitleBlock from './TitleBlock.tsx'

interface Props {
  title: ReactNode
  sub?: ReactNode
  back?: () => void
  needsLook?: number
}

/**
 * The in-app screen head: top bar, title and optional subtitle.
 * Hook-free: return AppHead({...}) from a Head.
 */
export default function AppHead({ title, sub, back, needsLook }: Props) {
  return (
    <>
      {HdrBar({ back, needsLook })}
      <TitleBlock title={title} sub={sub} titleStyle={{ marginTop: 10 }} />
    </>
  )
}

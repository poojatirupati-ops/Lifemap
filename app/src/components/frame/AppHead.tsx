import type { ReactNode } from 'react'
import HdrBar from './HdrBar.tsx'

interface Props {
  title: ReactNode
  sub?: ReactNode
  back?: () => void
  needsLook?: number
}

/** The in-app screen head: top bar, title and optional subtitle. Hook-free: return AppHead({...}) from a Head. */
export default function AppHead({ title, sub, back, needsLook }: Props) {
  return (
    <>
      {HdrBar({ back, needsLook })}
      <h2 className="t" tabIndex={-1} style={{ marginTop: 10 }}>
        {title}
      </h2>
      {sub && (
        <p className="sub" style={{ margin: 0 }}>
          {sub}
        </p>
      )}
    </>
  )
}

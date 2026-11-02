import type { ReactNode } from 'react'
import BackButton from './BackButton.tsx'
import Brand from './Brand.tsx'

/** The top bar of the onboarding screens: a back button or the brand, then anything on the right. */
export default function BrandBar({ back, right }: { back?: () => void; right?: ReactNode }) {
  return (
    <div className="topbar">
      {back ? <BackButton onClick={back} /> : <Brand />}
      {right}
    </div>
  )
}

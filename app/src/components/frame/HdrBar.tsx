import type { CSSProperties } from 'react'
import { useStore } from '../../state/store.ts'
import { SVG_BELL, SVG_CHAT } from '../ui/icons.data.ts'
import Svg from '../ui/Svg.tsx'
import BackButton from './BackButton.tsx'
import Brand from './Brand.tsx'

const DEFAULT_PHOTO = 'media/profile-photo.jpg'

/**
 * The in-app top bar: back button or brand, then Ask, the "needs a look" bell and the profile photo.
 * `needsLook` is how many money details need a look; the bell only shows inside the app.
 * Hook-free: call it as a function inside a screen's Head so splitHead keeps .topbar.hdr pinned.
 */
export default function HdrBar({ back, needsLook = 0 }: { back?: () => void; needsLook?: number }) {
  const { plan, openAsk, openSheet, showMoneyLooks } = useStore.getState()
  const bellCount = plan.app ? needsLook : 0
  // TODO(R-05): acct.photo is not in the Plan type yet (the profile photo upload sets it).
  const photo = (plan.acct as { photo?: string }).photo || DEFAULT_PHOTO

  return (
    <div className="topbar hdr">
      {back ? <BackButton onClick={back} /> : <Brand />}
      <div className="hdr-ic">
        <button
          className="icb hdr-ask"
          aria-label="Ask: help and plain-English explanations"
          onClick={openAsk}
        >
          <Svg src={SVG_CHAT} />
        </button>
        {bellCount > 0 && (
          <button
            className="icb"
            aria-label={`${bellCount} ${bellCount === 1 ? 'detail needs' : 'details need'} a look`}
            onClick={showMoneyLooks}
          >
            <Svg src={SVG_BELL} />
            <span className="badge" aria-hidden="true">
              {bellCount}
            </span>
          </button>
        )}
        <button
          className="avb"
          aria-label="Profile and privacy"
          onClick={() => openSheet('profile')}
        >
          <span className="ph" style={{ '--ph': `url(${photo})` } as CSSProperties}></span>
        </button>
      </div>
    </div>
  )
}

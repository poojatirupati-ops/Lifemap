import type { CSSProperties } from 'react'
import { useStore } from '../../state/store.ts'
import { BellIcon, ChatIcon } from '../ui/icons.tsx'
import BackButton from './BackButton.tsx'
import Brand from './Brand.tsx'
import { useFeature } from '../../shell/tenant.ts'
import { unseenLooks } from '../home/useHome.ts'

export const DEFAULT_PHOTO = '/media/profile-photo.jpg'

/**
 * The in-app top bar: back button or brand, then Ask, the "needs a look" bell and the profile photo.
 * With `bell`, the bell counts the money details that need a look; it only shows inside the app.
 */
export default function HdrBar({ back, bell }: { back?: () => void; bell?: boolean }) {
  const bellCount = useStore(({ plan }) => (bell && plan.hasResults ? unseenLooks(plan) : 0))
  const photo = useStore(({ plan }) => plan.account.photo || DEFAULT_PHOTO)
  const ask = useFeature('ask')
  const { openAsk, openSheet, showMoneyLooks } = useStore.getState()

  return (
    <div className="topbar hdr">
      {back ? <BackButton onClick={back} /> : <Brand />}
      <div className="hdr-ic">
        {ask && (
          <button
            className="icb hdr-ask"
            aria-label="Ask: help and plain-English explanations"
            onClick={openAsk}
          >
            <ChatIcon />
          </button>
        )}
        {bellCount > 0 ? (
          <button
            className="icb"
            aria-label={`${bellCount} ${bellCount === 1 ? 'detail needs' : 'details need'} a look`}
            onClick={showMoneyLooks}
          >
            <BellIcon />
            <span className="badge" aria-hidden="true">
              {bellCount}
            </span>
          </button>
        ) : null}
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

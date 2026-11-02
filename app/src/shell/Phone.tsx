import { useEffect, useRef, type CSSProperties } from 'react'
import { Outlet } from '@tanstack/react-router'
import { useRipple } from '../hooks/useRipple.ts'
import { useTilt } from '../hooks/useTilt.ts'
import SheetHost from './SheetHost.tsx'
import UpdatePrompt from './UpdatePrompt.tsx'
import Toast from './Toast.tsx'
import { router } from './router.ts'
import { useStore } from '../state/store.ts'

export default function Phone({ style }: { style?: CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null)
  useRipple(ref)
  useTilt(ref)
  // the browser's Back and Forward leave a sheet open over another page otherwise
  useEffect(
    () =>
      router.history.subscribe(({ action }) => {
        if (action.type !== 'PUSH' && action.type !== 'REPLACE') useStore.getState().closeSheet()
      }),
    [],
  )
  return (
    <div className="phone" id="phone" style={style}>
      <div className="sbar" aria-hidden="true">
        <b>9:41</b>
        <span className="sb-notch"></span>
        <span className="sb-ic">
          <svg width="18" height="12" viewBox="0 0 18 12">
            <rect x="0" y="8" width="3" height="4" rx="1" />
            <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
            <rect x="10" y="3" width="3" height="9" rx="1" />
            <rect x="15" y="0" width="3" height="12" rx="1" />
          </svg>
          <svg width="16" height="12" viewBox="0 0 16 12">
            <path d="M8 11.5 5.6 8.9a3.4 3.4 0 0 1 4.8 0zM3.4 6.7a6.5 6.5 0 0 1 9.2 0l-1.4 1.5a4.5 4.5 0 0 0-6.4 0zM1.1 4.4a9.7 9.7 0 0 1 13.8 0l-1.4 1.4a7.7 7.7 0 0 0-11 0z" />
          </svg>
          <svg width="26" height="12" viewBox="0 0 26 12">
            <rect
              x=".5"
              y=".5"
              width="22"
              height="11"
              rx="3.5"
              fill="none"
              stroke="currentColor"
              opacity=".45"
            />
            <rect x="2" y="2" width="17" height="8" rx="2" />
            <rect x="23.5" y="4" width="2" height="4" rx="1" opacity=".45" />
          </svg>
        </span>
      </div>
      {/* .enter stays on: each screen remounts its keyed child (shell/Screen.tsx), which replays the rise animation */}
      <div id="screen" className="enter" ref={ref}>
        <Outlet />
        <SheetHost />
        <UpdatePrompt />
      </div>
      <Toast />
    </div>
  )
}

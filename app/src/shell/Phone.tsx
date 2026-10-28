import type { CSSProperties } from 'react'
import ScreenHost from './ScreenHost.tsx'
import Toast from './Toast.tsx'

export default function Phone({ style }: { style?: CSSProperties }) {
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
      <ScreenHost />
      <Toast />
    </div>
  )
}

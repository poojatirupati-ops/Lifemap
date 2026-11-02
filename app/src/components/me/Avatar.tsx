import { useStore } from '../../state/store.ts'
import type { CSSProperties } from 'react'
import { changePhoto } from './meActions.ts'
import { DEFAULT_PHOTO } from '../frame/HdrBar.tsx'

/** The profile photo with its camera button; `ring` is the profile's percent done, drawn around it. */
export default function Avatar({ ring }: { ring?: number }) {
  const photo = useStore(({ plan }) => plan.account.photo)
  // the details page always says Change; the hub says Add until there is a photo
  const change = !!photo || ring == null

  return (
    <div className="mp-av">
      <span className="ph" style={{ backgroundImage: `url(${photo || DEFAULT_PHOTO})` }}></span>
      {ring != null && <i className="mp-ring" style={{ '--p': ring } as CSSProperties}></i>}
      <label className="mp-cam" title={change ? 'Change photo' : 'Add a photo'}>
        <input
          type="file"
          id="avup"
          accept="image/*"
          aria-label={change ? 'Change your photo' : 'Add a profile photo'}
          onChange={(event) => void changePhoto(event.currentTarget.files?.[0])}
        />
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
          <circle cx="12" cy="13" r="3.5" />
        </svg>
      </label>
    </div>
  )
}

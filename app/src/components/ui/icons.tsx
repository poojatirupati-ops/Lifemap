import type { ReactNode, SVGProps } from 'react'
import type { ProfileSection } from '../../domain/discovery/terms.data.ts'

/** The original's line icon: 24x24, round caps and joins, stroke in the text colour. */
const lineIcon = (shapes: ReactNode, props?: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    {shapes}
  </svg>
)

const goalIcon = (shapes: ReactNode) => lineIcon(shapes, { className: 'gi' })

/** Goal line icons by goal emoji. */
export const GOAL_ICONS: Record<string, ReactNode> = {
  '🪂': goalIcon(
    <>
      <path d="M12 3a9 9 0 0 1 9 9H3a9 9 0 0 1 9-9z" />
      <path d="M12 12v7a2 2 0 0 0 4 0" />
    </>,
  ),
  '🛟': goalIcon(
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4" />
      <path d="M5.6 5.6l3.6 3.6M14.8 14.8l3.6 3.6M18.4 5.6l-3.6 3.6M9.2 14.8l-3.6 3.6" />
    </>,
  ),
  '✈️': goalIcon(
    <path
      d="M10.5 13.5L3 11l2-2 7.5 1.5L17 6a2 2 0 0 1 3 3l-4.5 4.5L17 21l-2 2-2.5-7.5L9 19v2l-2 1-1-3-3-1 1-2h2z"
      transform="scale(.92) translate(1 0)"
    />,
  ),
  '🎓': goalIcon(
    <>
      <path d="M2 9l10-5 10 5-10 5z" />
      <path d="M6 11v5c3 2.5 9 2.5 12 0v-5" />
      <path d="M22 9v6" />
    </>,
  ),
  '🏡': goalIcon(
    <>
      <path d="M3 11l9-7 9 7" />
      <path d="M5 10v10h14V10" />
      <path d="M10 20v-6h4v6" />
    </>,
  ),
  '🏦': goalIcon(
    <>
      <path d="M3 9l9-5 9 5" />
      <path d="M4 9h16M5 9v9M9.5 9v9M14.5 9v9M19 9v9M3 20h18" />
    </>,
  ),
  '🌅': goalIcon(
    <>
      <path d="M3 18h18M6 18a6 6 0 0 1 12 0" />
      <path d="M12 4v3M4.9 8.9l2 2M19.1 8.9l-2 2M2 14h2M20 14h2" />
    </>,
  ),
  '👶': goalIcon(
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M5 21a7 7 0 0 1 14 0" />
      <path d="M10.5 8h.01M13.5 8h.01" />
    </>,
  ),
  '💍': goalIcon(
    <>
      <circle cx="12" cy="15" r="6" />
      <path d="M9 4h6l2 3-5 3-5-3z" />
    </>,
  ),
  '🚗': goalIcon(
    <>
      <path d="M5 16V11l2-5h10l2 5v5" />
      <path d="M3 16h18v3H3z" />
      <circle cx="7.5" cy="16" r="1.5" />
      <circle cx="16.5" cy="16" r="1.5" />
    </>,
  ),
  '📈': goalIcon(
    <>
      <path d="M3 20h18" />
      <path d="M5 16l5-5 3 3 6-7" />
      <path d="M15 7h4v4" />
    </>,
  ),
  '💼': goalIcon(
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18" />
    </>,
  ),
  '🌳': goalIcon(
    <>
      <path d="M12 21v-6" />
      <path d="M7 15a5 5 0 1 1 3-9 4 4 0 0 1 7 3 4 4 0 0 1-1 6z" />
    </>,
  ),
  '🎁': goalIcon(
    <>
      <rect x="3" y="9" width="18" height="12" rx="1.5" />
      <path d="M12 9v12M3 13h18" />
      <path d="M12 9c-2-4-6-4-6-1 0 1 1 1 6 1zM12 9c2-4 6-4 6-1 0 1-1 1-6 1z" />
    </>,
  ),
  '⭐': goalIcon(
    <path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z" />,
  ),
  '🩺': goalIcon(
    <>
      <path d="M6 3v6a5 5 0 0 0 10 0V3" />
      <path d="M11 14v2a4 4 0 0 0 8 0v-2" />
      <circle cx="19" cy="12" r="2" />
    </>,
  ),
  '🤝': goalIcon(
    <>
      <path d="M3 11l4-4 5 3 5-3 4 4-9 8z" />
      <path d="M9 13l3 2 3-2" />
    </>,
  ),
}

export const ChatIcon = () =>
  lineIcon(<path d="M21 11.5a8.4 8.4 0 0 1-12.3 7.4L3 21l2-5.3A8.4 8.4 0 1 1 21 11.5z" />, {
    width: 20,
    height: 20,
  })

export const BellIcon = () =>
  lineIcon(
    <>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" />
    </>,
    { width: 20, height: 20 },
  )

export const Logo = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <path
      d="M2.5 7l5.5-2.2 8 2.6 5.5-2.2v13.6L16 21l-8-2.6-5.5 2.2z"
      fill="#fff"
      fillOpacity=".22"
      stroke="#fff"
      strokeOpacity=".75"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <path d="M8 4.8v13.6M16 7.4V21" stroke="#fff" strokeOpacity=".55" strokeWidth="1.2" />
    <path
      d="M5 16.5c2.2-.2 2.6-3 5.6-3.4"
      stroke="#fff"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeDasharray="1.6 2"
    />
    <path
      d="M14.5 1.8a4.7 4.7 0 0 1 4.7 4.7c0 3.4-4.7 7.6-4.7 7.6S9.8 9.9 9.8 6.5a4.7 4.7 0 0 1 4.7-4.7z"
      fill="#fff"
    />
    <circle cx="14.5" cy="6.5" r="1.8" fill="#079E98" />
  </svg>
)

const tabIcon = { strokeWidth: 2 }
const tabIconNoJoin = { strokeWidth: 2, strokeLinejoin: undefined }

/** The tab bar's icons, by tab. */
export const TAB_ICONS = {
  explore: lineIcon(
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 8.5l-2 5-5 2 2-5z" />
    </>,
    tabIcon,
  ),
  home: lineIcon(
    <>
      <path d="M3 11l9-7 9 7" />
      <path d="M5 10v10h14V10" />
      <path d="M10 20v-6h4v6" />
    </>,
    tabIcon,
  ),
  plan: lineIcon(
    <>
      <path d="M4 18c3-6 6 2 9-4s4-6 7-6" />
      <circle cx="20" cy="8" r="1.6" fill="currentColor" />
    </>,
    { strokeWidth: 2.2, strokeLinejoin: undefined },
  ),
  me: lineIcon(
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
    </>,
    tabIconNoJoin,
  ),
  exp: lineIcon(<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.7A8 8 0 1 1 21 12Z" />, tabIconNoJoin),
}

const sectionIcon = { width: 22, height: 22 }

/** Your money terms: a line icon per profile section. */
export const SECTION_ICONS: Record<ProfileSection, ReactNode> = {
  mindset: lineIcon(
    <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />,
    sectionIcon,
  ),
  behaviour: lineIcon(
    <>
      <path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </>,
    sectionIcon,
  ),
  appetite: lineIcon(
    <>
      <path d="M4 17a8 8 0 1 1 16 0" />
      <path d="M12 17l4-5" />
    </>,
    sectionIcon,
  ),
  safety: lineIcon(<path d="M12 3l7 3v6c0 4.4-3 7.4-7 9-4-1.6-7-4.6-7-9V6z" />, sectionIcon),
  capacity: lineIcon(
    <>
      <rect x="3" y="8" width="15" height="8" rx="2" />
      <path d="M21 11v2M6 11h6" />
    </>,
    sectionIcon,
  ),
  horizon: lineIcon(
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
    </>,
    sectionIcon,
  ),
  experience: lineIcon(
    <>
      <path d="M3 9l9-5 9 5-9 5z" />
      <path d="M7 12v4c2.5 2 7.5 2 10 0v-4" />
    </>,
    sectionIcon,
  ),
}

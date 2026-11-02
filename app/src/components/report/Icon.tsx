// The report's line icons (24 x 24, stroke based).
import type { ReactNode } from 'react'

const STAR = <path d="M12 3.5 14.6 9l5.9.7-4.4 4 1.2 5.8L12 16.7 6.7 19.5l1.2-5.8-4.4-4L9.4 9z" />
const SUNRISE = (
  <>
    <path d="M5.5 17a6.5 6.5 0 0 1 13 0" />
    <path d="M3 17h18M12 5v2.4M4.6 9.6l1.7 1.5M19.4 9.6l-1.7 1.5M7 21h10" />
  </>
)
const HOME = <path d="M3.5 11 12 4l8.5 7M5.5 9.8V20h13V9.8M10 20v-5.5h4V20" />
const PLANE = <path d="M3 13.5 21 5l-4.5 15-4.2-5.2L9 18.5l.2-4.4z" />
const BOOK = (
  <path d="M3 6.5C5.5 5.2 8.3 5.2 12 7c3.7-1.8 6.5-1.8 9-.5V19c-2.5-1.3-5.3-1.3-9 .5-3.7-1.8-6.5-1.8-9-.5zM12 7v12.5" />
)

const ICONS: Record<string, ReactNode> = {
  sun: (
    <>
      <circle cx="12" cy="12" r="3.6" />
      <path d="M12 3v2.4M12 18.6V21M3 12h2.4M18.6 12H21M5.6 5.6l1.7 1.7M16.7 16.7l1.7 1.7M5.6 18.4l1.7-1.7M16.7 7.3l1.7-1.7" />
    </>
  ),
  partly: (
    <>
      <circle cx="8" cy="8" r="2.6" />
      <path d="M8 2.4v1.2M2.4 8h1.2M3.9 3.9l.9.9M12.1 3.9l-.9.9" />
      <path d="M8.5 20.5h8.8a3.5 3.5 0 0 0 .4-7 5 5 0 0 0-9.4 1.3 3 3 0 0 0 .2 5.7z" />
    </>
  ),
  storm: (
    <>
      <path d="M7.5 15.5a4 4 0 0 1-.3-7.9 5.2 5.2 0 0 1 9.9 1 3.5 3.5 0 0 1 .4 6.9" />
      <path d="M12.6 12.2 10.4 16h3.2l-2 4" />
    </>
  ),
  sunrise: SUNRISE,
  retire: SUNRISE,
  family: (
    <>
      <circle cx="8" cy="7.5" r="3" />
      <circle cx="17" cy="9" r="2.3" />
      <path d="M2.8 20c.2-3.6 2.4-5.8 5.2-5.8s5 2.2 5.2 5.8M14.6 14.7c.8-.4 1.5-.5 2.4-.5 2.3 0 3.9 1.9 4.1 5" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.8 8.2-2 5.6-5.6 2 2-5.6z" />
    </>
  ),
  home: HOME,
  house: HOME,
  car: (
    <>
      <path d="M4 16.5V12l1.8-4.5a1.5 1.5 0 0 1 1.4-1h9.6a1.5 1.5 0 0 1 1.4 1L20 12v4.5M4 12h16M4 16.5h16" />
      <circle cx="7.8" cy="16.6" r="1.6" />
      <circle cx="16.2" cy="16.6" r="1.6" />
    </>
  ),
  plane: PLANE,
  holiday: PLANE,
  book: BOOK,
  education: BOOK,
  shield: (
    <>
      <path d="M12 3 4.5 6v5.5c0 4.6 3 7.8 7.5 9.5 4.5-1.7 7.5-4.9 7.5-9.5V6z" />
      <path d="m8.8 12 2.3 2.3 4.2-4.6" />
    </>
  ),
  heart: (
    <path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z" />
  ),
  check: <path d="m5 12.5 4.3 4.3L19 7.2" />,
  target: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.6" />
      <circle cx="12" cy="12" r="1.2" />
    </>
  ),
}

interface IconProps {
  name: string
  size?: number
  color?: string
  strokeWidth?: number
}

export default function Icon({
  name,
  size = 22,
  color = 'currentColor',
  strokeWidth = 1.8,
}: IconProps) {
  return (
    <svg
      className="lmr-ico"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {ICONS[name] ?? STAR}
    </svg>
  )
}

const GOAL_ICONS: [RegExp, string][] = [
  [/famil|baby|child/, 'family'],
  [/retire|pension/, 'retire'],
  [/home|house|mortgage|deposit/, 'home'],
  [/car|vehicle/, 'car'],
  [/holiday|travel|trip/, 'plane'],
  [/educat|school|college|study/, 'book'],
  [/emergen|protect|safe/, 'shield'],
  [/wedding|love|marr/, 'heart'],
]

/** The icon for a goal: its icon, kind or name when that is an icon, else a match on the words. */
export function goalIconName(goal: { icon?: string; kind?: string; name?: string }) {
  const key = String(goal.icon || goal.kind || goal.name || '').toLowerCase()
  if (key in ICONS && key !== 'check') return key
  return GOAL_ICONS.find(([words]) => words.test(key))?.[1] ?? 'target'
}

// One A4 report page (running header, content, footer with its number) and the parts pages share.
import type { CSSProperties, ReactNode } from 'react'
import type { ReportData } from '../../report/model/reportData.ts'
import Icon from './Icon.tsx'
import { COLOURS, textOf, tintOf } from './tones.ts'

/** What every page component gets: the report's data, its page number and the page count. */
export interface PageProps {
  data: ReportData
  page: number
  total: number
}

interface PageFrameProps extends PageProps {
  label: string
  /** shown above the header, which then reads light on dark */
  hero?: ReactNode
  children: ReactNode
}

export function PageFrame({ data, page, total, label, hero, children }: PageFrameProps) {
  return (
    <section
      className="lmr-pg"
      data-page={page}
      role="group"
      aria-label={`Page ${page} of ${total}: ${label}`}
    >
      {hero}
      <div className="lmr-rh">
        <Logo style={hero ? { color: '#fff' } : undefined} />
        <span className="lmr-rr" style={hero ? { color: '#cfd9e6' } : undefined}>
          {data.meta.headerRight}
        </span>
      </div>
      {children}
      <div className="lmr-rf">
        <span>Preliminary guidance, not financial advice. Illustrative, not guaranteed.</span>
        <span>
          {page} / {total}
        </span>
      </div>
    </section>
  )
}

export function Logo({ style }: { style?: CSSProperties }) {
  return (
    <span className="lmr-logo" style={style}>
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="12" fill={COLOURS.teal} />
        <path
          d="M8.2 16.4 14.6 7.8"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="14.9" cy="7.5" r="1.4" fill="#fff" />
      </svg>
      <b>LifeMap</b>
    </span>
  )
}

interface TitleBlockProps {
  big: string
  bigTone?: string
  bigLabel?: string
  eyebrow?: string
  title: string
  lead?: string
}

/** A page's big number beside its eyebrow, title and lead. Long numbers shrink to one line (never below 34px). */
export function TitleBlock({ big, bigTone, bigLabel, eyebrow, title, lead }: TitleBlockProps) {
  const fontSize = big.length > 8 ? Math.max(34, Math.round((64 * 8) / big.length)) : undefined
  return (
    <div className="lmr-tb">
      <div className="lmr-bn">
        <div className="lmr-bnum" style={{ color: textOf(bigTone), fontSize }}>
          {big}
        </div>
        {bigLabel ? <div className="lmr-bl">{bigLabel}</div> : null}
      </div>
      <div className="lmr-tx">
        {eyebrow ? <div className="lmr-ey">{eyebrow}</div> : null}
        <h1 className="lmr-title">{title}</h1>
        {lead ? <p className="lmr-lead">{lead}</p> : null}
      </div>
    </div>
  )
}

/** A line icon on a round tint of its tone; the icon is half the circle unless `iconSize` says. */
export function CircleIcon(props: {
  name: string
  tone?: string
  size?: number
  iconSize?: number
}) {
  const { name, tone, size = 44, iconSize = Math.round(size * 0.5) } = props
  return (
    <span
      className="lmr-circ"
      style={{ width: size, height: size, background: tintOf(tone), color: textOf(tone) }}
    >
      <Icon name={name} size={iconSize} />
    </span>
  )
}

/** "On track", "Nearly there" or "Needs attention" with its weather icon. */
export function BandChip({ tone, text }: { tone: string; text: string }) {
  const icon = tone === 'good' ? 'sun' : tone === 'gold' ? 'partly' : 'storm'
  return (
    <span className="lmr-chip" style={{ color: textOf(tone) }}>
      <CircleIcon name={icon} tone={tone} size={22} iconSize={14} />
      {text}
    </span>
  )
}

// The report's photos are the app's own art, read from its CSS custom properties.
const PHOTOS: Record<string, { variable: string; alt: string }> = {
  'money-plant': { variable: '--art-savings', alt: 'A potted money plant growing by a window' },
  'retired-reading': {
    variable: '--art-pension',
    alt: 'A retired man reading a newspaper in an armchair',
  },
  'car-and-calculator': {
    variable: '--art-everyday',
    alt: 'A toy car, calculator and insurance papers',
  },
  'house-for-sale': { variable: '--art-mortgage', alt: 'A house with a for-sale sign' },
  'team-with-charts': {
    variable: '--art-investing',
    alt: 'A team of advisers around a table of charts',
  },
  'magnifier-map': {
    variable: '--cover-photo',
    alt: 'A hand holding a magnifying glass over a map',
  },
}

const CSS_URL = /url\(\s*["']?([^"')]+)["']?\s*\)/

/** The photo from the app's CSS, else /media/<name>.jpg (outside a browser, in tests). */
export function Photo({ name }: { name?: string }) {
  if (!name) return null
  const variable = PHOTOS[name]?.variable
  const value =
    variable && typeof document !== 'undefined'
      ? getComputedStyle(document.documentElement).getPropertyValue(variable)
      : ''
  return (
    <img src={value.match(CSS_URL)?.[1] ?? `/media/${name}.jpg`} alt={PHOTOS[name]?.alt ?? ''} />
  )
}

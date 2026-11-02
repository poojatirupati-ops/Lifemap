// Report page 1: the photo, who it is for, the road ahead and three headline tiles.
import CircleIcon from './CircleIcon.tsx'
import Logo from './Logo.tsx'
import type { PageProps } from './PageFrame.tsx'
import Photo from './Photo.tsx'
import Road from './Road.tsx'
import { COLOURS } from './tones.ts'

const ROAD = { height: 282, startX: 111, endX: 747, middleY: 148, stem: 50, endLabelX: 744 }

export default function CoverPage({ data, total }: PageProps) {
  const { cover } = data
  return (
    <section
      className="lmr-pg lmr-cover"
      data-page="1"
      role="group"
      aria-label={`Page 1 of ${total}: Cover`}
    >
      <div className="lmr-cv-dark"></div>
      <div className="lmr-cv-bar">
        <i style={{ flex: 3, background: COLOURS.tealMid }}></i>
        <i style={{ flex: 1, background: COLOURS.gold }}></i>
        <i style={{ flex: 1, background: COLOURS.coral }}></i>
      </div>
      <div className="lmr-cv-photo">
        <Photo name="magnifier-map" />
      </div>
      <div className="lmr-cv-badge">YOUR PERSONAL PLAN</div>
      <div className="lmr-cv-logo">
        <Logo />
      </div>
      <div className="lmr-cv-ey">{cover.eyebrow}</div>
      <h1 className="lmr-cv-title">{cover.title}</h1>
      <p className="lmr-cv-lead">
        A clear, indicative guide to where you are, where you’re heading, and who can help you get
        there.
      </p>
      <div className="lmr-cv-road">
        <Road road={data.road} layout={ROAD} />
      </div>
      <div className="lmr-cv-tiles">
        {cover.tiles.map((tile) => (
          <div className="lmr-cv-tile" key={tile.small}>
            <CircleIcon name={tile.icon} tone={tile.tone} size={36} iconSize={20} />
            <div>
              <div className="lmx-b lmr-hd" style={{ color: COLOURS.navy }}>
                {tile.big}
              </div>
              <div className="lmx-s">{tile.small}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="lmr-cv-foot">
        Version 1 · Preliminary guidance, not financial advice. An indicative guide: an expert can
        confirm the details.
      </div>
    </section>
  )
}

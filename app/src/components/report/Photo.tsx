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

/** The photo's URL from the app's CSS, else media/<name>.jpg (outside a browser, in tests). */
function photoSrc(name: string) {
  const variable = PHOTOS[name]?.variable
  const value =
    variable && typeof document !== 'undefined'
      ? getComputedStyle(document.documentElement).getPropertyValue(variable)
      : ''
  return value.match(CSS_URL)?.[1] ?? `media/${name}.jpg`
}

export default function Photo({ name }: { name?: string }) {
  if (!name) return null
  return <img src={photoSrc(name)} alt={PHOTOS[name]?.alt ?? ''} />
}

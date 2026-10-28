/** class -> className, stroke-width -> strokeWidth; aria-* and data-* stay as they are. */
const toReactProp = (attribute: string) => {
  if (attribute === 'class') return 'className'
  if (/^(aria|data)-/.test(attribute)) return attribute
  return attribute.replace(/-(\w)/g, (_, letter: string) => letter.toUpperCase())
}

/** Renders an SVG string from icons.data.ts as a real <svg> element, with no wrapper around it. */
export default function Svg({ src }: { src: string }) {
  const [, attributes, inner] = src.match(/^<svg([^>]*)>([\s\S]*)<\/svg>$/)!
  const props = Object.fromEntries(
    [...attributes.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, name, value]) => [
      toReactProp(name),
      value,
    ]),
  )
  return <svg {...props} dangerouslySetInnerHTML={{ __html: inner }} />
}

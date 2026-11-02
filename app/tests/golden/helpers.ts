// Helpers the golden tests share: the original's prepared state, seeded random plans, DOM shapes.
import { JSDOM } from 'jsdom'

/** The original's state after what it runs before drawing a screen (assumptions, lists, emergency fund). */
export function prepared(original: any, state: any) {
  original.setState(structuredClone(state))
  original.applyAssume()
  original.syncLists()
  original.autoSafety()
  return structuredClone(original.getState())
}

/** A small seeded generator (mulberry32), so a failure can be replayed. */
export function random(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Seeded choices for building random plans: one of the options, or a whole number in a range. */
export function chooser(seed: number) {
  const next = random(seed)
  return {
    pick: <T>(...options: T[]) => options[Math.floor(next() * options.length)],
    between: (low: number, high: number) => Math.round(low + next() * (high - low)),
  }
}

/** The original's dispatcher attributes, which our markup leaves out. */
export const withoutActions = (html: string) => html.replace(/ data-[ap]="[^"]*"/g, '')

/** A style attribute as the browser writes it back. */
function cssText(style: string) {
  const probe = document.createElement('i')
  probe.style.cssText = style
  return probe.style.cssText
}

/** Tags, sorted attributes and text, styles as the browser writes them; `ignored` attributes are left out. */
export function shape(html: string, ignored: ReadonlySet<string> = new Set()) {
  const walk = (node: Node): string => {
    if (node.nodeType === 3) return node.textContent ?? ''
    const el = node as Element
    const attrs = [...el.attributes]
      .filter((attr) => !ignored.has(attr.name))
      .map((attr) => `${attr.name}=${attr.name === 'style' ? cssText(attr.value) : attr.value}`)
      .sort()
    return `<${el.tagName} ${attrs.join(' ')}>${[...el.childNodes].map(walk).join('')}</>`
  }
  const body = new JSDOM(html).window.document.body
  return [...body.childNodes].map(walk).join('').split('<')
}

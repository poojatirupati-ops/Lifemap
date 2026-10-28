// Shared by tools/view-equal.mjs and tools/visual-diff.mjs: turn a rendered view into comparable
// lines, diff two states, and diff two screenshots.
import pixelmatch from 'pixelmatch'
import { PNG } from 'pngjs'

const MAX_DIFF_LINES = 40

/**
 * Runs in the page (passed to page.evaluate, so it must stay self-contained).
 * One line per element or text run, indented by depth. Normalised: attributes and class names
 * sorted, inline style read back through the CSSOM, inputs show their live value, adjacent text
 * merged, inline on* handlers dropped.
 */
export function viewLines(selector) {
  const lines = []
  const attributesOf = (element) => {
    const attributes = {}
    for (const { name, value } of element.attributes) {
      if (name.startsWith('on')) continue
      attributes[name] = value
    }
    if (attributes.class !== undefined) {
      attributes.class = attributes.class.split(/\s+/).filter(Boolean).sort().join(' ')
    }
    if (attributes.style !== undefined) {
      const style = element.style
      attributes.style = [...style]
        .sort()
        .map((property) => `${property}: ${style.getPropertyValue(property)}`)
        .join('; ')
    }
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName)) attributes.value = element.value
    if (element.type === 'checkbox' || element.type === 'radio')
      attributes.checked = element.checked
    return Object.keys(attributes)
      .sort()
      .map((name) => ` ${name}=${JSON.stringify(attributes[name])}`)
      .join('')
  }
  const walk = (node, depth) => {
    const indent = '  '.repeat(depth)
    let text = ''
    const flushText = () => {
      if (text) lines.push(indent + JSON.stringify(text))
      text = ''
    }
    for (const child of node.childNodes) {
      if (child.nodeType === Node.TEXT_NODE) {
        text += child.data
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        flushText()
        lines.push(`${indent}<${child.tagName.toLowerCase()}${attributesOf(child)}>`)
        if (child.tagName !== 'TEXTAREA') walk(child, depth + 1) // its live value is the attribute
      }
    }
    flushText()
  }
  for (const root of document.querySelectorAll(selector)) {
    lines.push(`#${root.id}`)
    walk(root, 1)
  }
  return lines
}

/** The changed middle of two line lists, as "- proto" / "+ app" lines (empty when equal). */
export function diffLines(proto, app) {
  let start = 0
  while (start < proto.length && start < app.length && proto[start] === app[start]) start++
  const shortest = Math.min(proto.length, app.length) - start
  const sameFromEnd = (offset) => proto.at(-1 - offset) === app.at(-1 - offset)
  let end = 0
  while (end < shortest && sameFromEnd(end)) end++
  const removed = proto.slice(start, proto.length - end).map((line) => `- ${line}`)
  const added = app.slice(start, app.length - end).map((line) => `+ ${line}`)
  if (!removed.length && !added.length) return []
  return [
    `@@ line ${start + 1}`,
    ...removed.slice(0, MAX_DIFF_LINES),
    ...added.slice(0, MAX_DIFF_LINES),
  ]
}

const isObject = (value) => value !== null && typeof value === 'object'

/** Paths where two JSON values differ, key order ignored: "S.a.b[2]: proto 1 | app 2". */
export function diffObj(proto, app, path = 'S') {
  const bothObjects =
    isObject(proto) && isObject(app) && Array.isArray(proto) === Array.isArray(app)
  if (!bothObjects) {
    const [left, right] = [JSON.stringify(proto), JSON.stringify(app)]
    return left === right ? [] : [`${path}: proto ${left} | app ${right}`]
  }
  const keys = [...new Set([...Object.keys(proto), ...Object.keys(app)])]
  return keys.flatMap((key) =>
    diffObj(proto[key], app[key], Array.isArray(proto) ? `${path}[${key}]` : `${path}.${key}`),
  )
}

/** Percent of differing pixels between two PNGs, over their common top-left area, plus the diff image. */
export function pixelDiff(a, b) {
  const width = Math.min(a.width, b.width)
  const height = Math.min(a.height, b.height)
  const crop = (png) => {
    const cropped = new PNG({ width, height })
    PNG.bitblt(png, cropped, 0, 0, width, height, 0, 0)
    return cropped.data
  }
  const diff = new PNG({ width, height })
  const changed = pixelmatch(crop(a), crop(b), diff.data, width, height, { threshold: 0.1 })
  return { percent: (changed / (width * height)) * 100, diff }
}

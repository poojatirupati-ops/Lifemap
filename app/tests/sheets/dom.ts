// Renders our components and compares their DOM with the ORIGINAL's HTML strings, run in node:vm.
import { JSDOM } from 'jsdom'
import { act, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'

// a DOM for React to render into; these files run in node because the original is read from disk
const page = new JSDOM('<!doctype html><body></body>', { url: 'http://localhost/' })
Object.assign(globalThis, {
  window: page.window,
  document: page.window.document,
  HTMLElement: page.window.HTMLElement,
  matchMedia: () => ({ matches: true }),
  IS_REACT_ACT_ENVIRONMENT: true,
})
const DISPATCH = new Set(['data-a', 'data-p'])

function cssText(style: string) {
  const probe = document.createElement('i')
  probe.style.cssText = style
  return probe.style.cssText
}

/** Tags, sorted attributes and text; the original's dispatcher attributes and style spacing ignored. */
export function shape(html: string) {
  const walk = (node: Node): string => {
    if (node.nodeType === 3) return node.textContent ?? ''
    const el = node as Element
    const attrs = [...el.attributes]
      .filter((attr) => !DISPATCH.has(attr.name))
      .map((attr) => `${attr.name}=${attr.name === 'style' ? cssText(attr.value) : attr.value}`)
      .sort()
    return `<${el.tagName} ${attrs.join(' ')}>${[...el.childNodes].map(walk).join('')}</>`
  }
  const body = new JSDOM(html).window.document.body
  return [...body.childNodes].map(walk).join('').split('<')
}

/** Our markup for an element, rendered once. */
export function rendered(element: ReactNode) {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  act(() => root.render(element))
  const html = container.innerHTML
  act(() => root.unmount())
  container.remove()
  return html
}

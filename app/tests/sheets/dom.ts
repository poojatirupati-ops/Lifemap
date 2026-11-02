// Renders our components and compares their DOM with the ORIGINAL's HTML strings, run in node:vm.
import { JSDOM } from 'jsdom'
import { act, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import { shape as shapeWithout } from '../golden/helpers'

// A browser for React to render into. These files stay in node (the original is read from disk with
// node's URL), so the window's globals that node lacks are copied over.
const page = new JSDOM('<!doctype html><body></body>', { url: 'http://localhost/' })
// events must be the window's own, or its elements refuse them
for (const key of Object.getOwnPropertyNames(page.window))
  if (!(key in globalThis) || /Event(Target)?$/.test(key))
    Object.assign(globalThis, { [key]: page.window[key as keyof typeof page.window] })
Object.assign(globalThis, {
  window: page.window,
  matchMedia: () => ({ matches: true }), // reduced motion
  IS_REACT_ACT_ENVIRONMENT: true,
})
const DISPATCH = new Set(['data-a', 'data-p'])

/** Tags, sorted attributes and text; the original's dispatcher attributes and style spacing ignored. */
export const shape = (html: string) => shapeWithout(html, DISPATCH)

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

import { useLayoutEffect, type RefObject } from 'react'
import { prefersReducedMotion } from './reducedMotion.ts'

const FIGURES = '.tlv-big,.gauge b,.stiles b,.tlv-stats b,.wi-val,.hc-stats span'
const DURATION_MS = 900
const FIGURE = /^(\D*)([\d.,]+)(.*)$/s

const isYear = (value: number, decimals: number) => value > 1900 && value < 2200 && decimals === 0
const easeOutCubic = (progress: number) => 1 - (1 - progress) ** 3
const isDigitText = (node: ChildNode): node is Text =>
  node instanceof Text && /\d/.test(node.textContent ?? '')
const firstDigitText = (figure: Element) => [...figure.childNodes].find(isDigitText)

/** Animate one text node from 0 to its figure; returns a stop that puts the real figure back. */
function countUpText(node: Text): (() => void) | undefined {
  const finalText = node.textContent ?? ''
  const match = finalText.match(FIGURE)
  if (!match) return
  const [, prefix, digits, suffix] = match
  const plain = digits.replace(/,/g, '')
  const target = parseFloat(plain)
  const decimals = (plain.split('.')[1] ?? '').length
  if (!isFinite(target) || target === 0 || isYear(target, decimals)) return

  const format = (value: number) =>
    decimals ? value.toFixed(decimals) : Math.round(value).toLocaleString('en-IE')
  const start = performance.now()
  let shown = finalText
  let frame = 0

  const step = (now: number) => {
    // React wrote a new figure mid-count: it wins.
    if (node.textContent !== shown) return
    const progress = Math.min(1, (now - start) / DURATION_MS)
    shown = prefix + format(target * easeOutCubic(progress)) + suffix
    node.textContent = shown
    if (progress < 1) frame = requestAnimationFrame(step)
  }
  frame = requestAnimationFrame(step)

  return () => {
    cancelAnimationFrame(frame)
    if (node.textContent === shown) node.textContent = finalText
  }
}

/** Big figures count up when a screen opens (not on re-renders of the same screen). */
export function useCountUp(ref: RefObject<HTMLElement | null>, screenKey: string) {
  useLayoutEffect(() => {
    const root = ref.current
    if (!root || prefersReducedMotion()) return
    const stops = [...root.querySelectorAll(FIGURES)].flatMap((figure) => {
      const node = firstDigitText(figure)
      return node ? (countUpText(node) ?? []) : []
    })
    return () => stops.forEach((stop) => stop())
  }, [ref, screenKey])
}

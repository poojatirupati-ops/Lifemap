import type { ReactNode } from 'react'

/** One emoji with its modifiers, skin tones and joined parts. */
const EMOJI =
  /(?:\p{Extended_Pictographic}|\p{Regional_Indicator})(?:\uFE0F|\u20E3|[\u{1F3FB}-\u{1F3FF}]|\u200D(?:\p{Extended_Pictographic}|\p{Regional_Indicator})\uFE0F?|\p{Regional_Indicator})*/gu

/**
 * Text whose emoji are decoration: each emoji is wrapped in an aria-hidden span so the accessible
 * name is words only. Use it in headings, buttons, links, labels, pills, tags and eyebrows that have
 * no aria-label. Text that is only emoji stays readable, so a control never loses its name.
 */
export default function Emo({ children: text }: { children: string }) {
  if (!text.replace(EMOJI, '').trim()) return text

  const parts: ReactNode[] = []
  let end = 0
  for (const match of text.matchAll(EMOJI)) {
    parts.push(text.slice(end, match.index))
    parts.push(
      <span key={match.index} aria-hidden="true">
        {match[0]}
      </span>,
    )
    end = match.index + match[0].length
  }
  parts.push(text.slice(end))
  return parts
}

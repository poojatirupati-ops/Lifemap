import { useEffect, useRef } from 'react'
import type { Question } from '../../content/discover.data.ts'
import DiscoverOption from './DiscoverOption.tsx'
import DiscoverPanel from './DiscoverPanel.tsx'
import { CHAPTERS } from './chapters.data.ts'

export default function DiscoverQuestion({ q, chapter, selected, onPick }: { q: Question; chapter: number; selected?: number; onPick: (o: number) => void }) {
  const h = useRef<HTMLHeadingElement>(null)
  useEffect(() => h.current?.focus(), [])
  return (
    <>
      <p className="eyebrow">{chapter + 1} · {CHAPTERS[chapter]}</p>
      <h1 ref={h} tabIndex={-1}>{q.q}</h1>
      {q.sub && <p className="disc-sub">{q.sub}</p>}
      {q.panel && <DiscoverPanel panel={q.panel} />}
      {q.o.map((o, n) => <DiscoverOption key={o.t} o={o} selected={selected === n} onPick={() => onPick(n)} />)}
    </>
  )
}

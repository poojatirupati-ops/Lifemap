import { CHAPTERS } from './chapters.data.ts'

/** Five chapter segments; the current chapter and those before it are filled. */
export default function DiscoverProgress({ chapter }: { chapter: number }) {
  return (
    <div className="chaps" role="progressbar" aria-label="Progress" aria-valuemin={1} aria-valuemax={CHAPTERS.length} aria-valuenow={chapter + 1}>
      {CHAPTERS.map((c, n) => <i key={c}><b style={{ width: n <= chapter ? '100%' : 0 }} /></i>)}
    </div>
  )
}

// Fills the content cache with a snapshot of the seeded CMS, so screens render without a CMS running.
import { contentClient } from '../../src/content/cms.tsx'
import snapshot from './cms.json'

export function seedContent() {
  for (const [path, docs] of Object.entries(snapshot)) contentClient.setQueryData([path], docs)
}

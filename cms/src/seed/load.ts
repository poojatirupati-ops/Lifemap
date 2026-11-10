// Loads the content in content.json (exported from the dev CMS) under the "LifeMap" tenant.
// Used by the seed migration (an empty CMS, on deploy) and by `npm run seed` (dev: wipe, then reload).
import path from 'path'
import type { CollectionSlug, Payload, PayloadRequest } from 'payload'
import content from './content.json' with { type: 'json' }

type Doc = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any

/** The seeded collections, in creation order: each comes after the ones it links to. */
export const SEEDED = Object.keys(content) as CollectionSlug[]

/** True when any seeded collection already has a document (an editor's or an earlier seed's). */
export async function hasContent(payload: Payload, req?: Partial<PayloadRequest>) {
  for (const collection of SEEDED)
    if ((await payload.count({ collection, req })).totalDocs) return true
  return false
}

/** Creates every seeded document (and the LifeMap tenant if missing); req keeps it inside a migration's transaction. */
export async function seedContent(payload: Payload, req?: Partial<PayloadRequest>) {
  const tenant = (
    (await payload.find({ collection: 'tenants', where: { slug: { equals: 'lifemap' } }, req }))
      .docs[0] ??
    (await payload.create({
      collection: 'tenants',
      data: { name: 'LifeMap', slug: 'lifemap' },
      req,
    }))
  ).id

  /** Exported id -> new id, per collection. */
  const ids: Record<string, Record<number, number>> = {}
  const ref = (collection: string) => (id: number | null | undefined) =>
    id == null ? id : ids[collection][id]

  /** Points an exported doc's relationships at the new ids. */
  const relink: Partial<Record<CollectionSlug, (d: Doc) => Doc>> = {
    calculators: (d) => ({ ...d, category: ref('explore-categories')(d.category) }),
    topics: (d) => ({
      ...d,
      category: ref('explore-categories')(d.category),
      tools: d.tools?.map(ref('calculators')),
    }),
    videos: (d) => ({ ...d, captions: ref('media')(d.captions), topic: ref('topics')(d.topic) }),
    journeys: (d) => ({
      ...d,
      topic: ref('topics')(d.topic),
      calculators: d.calculators?.map((c: Doc) => ({ ...c, tool: ref('calculators')(c.tool) })),
      stories: d.stories?.map((s: Doc) => ({ ...s, video: ref('videos')(s.video) })),
      reading: d.reading?.map(ref('articles')),
      live: d.live?.map(ref('live-sessions')),
    }),
  }

  for (const collection of SEEDED) {
    ids[collection] = {}
    for (const { id, filename, ...data } of (content as Record<string, Doc[]>)[collection]) {
      const doc = await payload.create({
        collection,
        data: { ...(relink[collection]?.(data) ?? data), tenant } as never,
        draft: data._status === 'draft',
        filePath: filename && path.resolve(import.meta.dirname, filename),
        req,
      })
      ids[collection][id] = doc.id as number
    }
  }
  for (const collection of SEEDED)
    payload.logger.info(`${collection}: ${(await payload.count({ collection, req })).totalDocs}`)
}

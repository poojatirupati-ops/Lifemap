// Loads the content in src/seed/content.json (exported from the dev CMS) under the "LifeMap" tenant. Re-runnable: it
// wipes the content collections first (not users). Run: npm run seed
import path from 'path'
import { getPayload, type CollectionSlug } from 'payload'
import config from '@payload-config'
import content from './seed/content.json' with { type: 'json' }

type Doc = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
const payload = await getPayload({ config })

// Creation order: each collection comes after the ones it links to.
const SEEDED = Object.keys(content) as CollectionSlug[]
for (const collection of SEEDED) await payload.delete({ collection, where: { id: { exists: true } } })

const tenant = (
  (await payload.find({ collection: 'tenants', where: { slug: { equals: 'lifemap' } } })).docs[0] ??
  (await payload.create({ collection: 'tenants', data: { name: 'LifeMap', slug: 'lifemap' } }))
).id

const email = process.env.SEED_STAFF_EMAIL
const password = process.env.SEED_STAFF_PASSWORD
if (email && password && !(await payload.find({ collection: 'users', where: { email: { equals: email } } })).totalDocs)
  await payload.create({ collection: 'users', data: { email, password } })

/** Exported id -> new id, per collection. */
const ids: Record<string, Record<number, number>> = {}
const ref = (collection: string) => (id: number | null | undefined) => (id == null ? id : ids[collection][id])

/** Points an exported doc's relationships at the new ids. */
const relink: Partial<Record<CollectionSlug, (d: Doc) => Doc>> = {
  calculators: (d) => ({ ...d, category: ref('explore-categories')(d.category) }),
  topics: (d) => ({ ...d, category: ref('explore-categories')(d.category), tools: d.tools?.map(ref('calculators')) }),
  videos: (d) => ({ ...d, captions: ref('media')(d.captions) }),
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
      filePath: filename && path.resolve(import.meta.dirname, 'seed', filename),
    })
    ids[collection][id] = doc.id as number
  }
}

for (const collection of SEEDED) payload.logger.info(`${collection}: ${(await payload.count({ collection })).totalDocs}`)
process.exit(0)

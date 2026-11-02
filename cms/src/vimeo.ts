// Video files never pass through the CMS: the editor's browser uploads straight to Vimeo with tus (VimeoUpload field).
// The CMS only asks Vimeo for the upload ticket, polls transcoding (vimeoPoll) and deletes uploads no longer used.
import { Vimeo } from '@vimeo/vimeo'
import {
  APIError,
  type CollectionAfterChangeHook,
  type CollectionAfterDeleteHook,
  type CollectionBeforeDeleteHook,
  type Endpoint,
  type PayloadRequest,
  type TaskConfig,
} from 'payload'

export type VimeoStatus = 'uploading' | 'transcoding' | 'ready' | 'failed'

/** "1:14" from seconds. */
export const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const vimeo = async (options: { method?: string; path: string; query?: object }): Promise<any> =>
  (await new Vimeo(null, null, process.env.VIMEO_ACCESS_TOKEN).request(options)).body

/** Our status from Vimeo's upload and transcode states. */
export const statusOf = (v: { upload?: { status?: string }; transcode?: { status?: string } }): VimeoStatus =>
  v.upload?.status === 'error' || v.transcode?.status === 'error'
    ? 'failed'
    : v.transcode?.status === 'complete'
      ? 'ready'
      : v.upload?.status === 'complete'
        ? 'transcoding'
        : 'uploading'

/** Creates the Vimeo video and returns the tus upload link the browser sends the file to. Hidden on vimeo.com, embed only on the app's origins. */
export const createVimeoUpload = async ({ name, size }: { name: string; size: number }) => {
  const video = await vimeo({
    method: 'POST',
    path: '/me/videos',
    query: { name, upload: { approach: 'tus', size }, privacy: { view: 'disable', embed: 'whitelist' } },
  })
  const vimeoId = String(video.uri).split('/').pop()!
  // The app's origins are the CMS's CORS list.
  for (const origin of (process.env.CMS_CORS_ORIGINS || '').split(',').filter(Boolean)) {
    await vimeo({ method: 'PUT', path: `/videos/${vimeoId}/privacy/domains/${new URL(origin).hostname}` })
  }
  return { vimeoId, uploadLink: String(video.upload.upload_link) }
}

/** POST /api/videos/vimeo-upload { name, size }: staff only; JSON metadata in, upload link out. */
export const vimeoUploadEndpoint: Endpoint = {
  path: '/vimeo-upload',
  method: 'post',
  handler: async (req) => {
    if (!req.user) throw new APIError('Log in to upload.', 401, null, true)
    if (!process.env.VIMEO_ACCESS_TOKEN) throw new APIError('Vimeo is not configured (VIMEO_ACCESS_TOKEN).', 503, null, true)
    const { name, size } = (await req.json?.()) ?? {}
    if (typeof name !== 'string' || !Number.isSafeInteger(size) || size <= 0) {
      throw new APIError('Expected { name, size }.', 400, null, true)
    }
    return Response.json(await createVimeoUpload({ name, size }))
  },
}

export const queueVimeoPoll: CollectionAfterChangeHook = async ({ doc, previousDoc, req }) => {
  if (['uploading', 'transcoding'].includes(doc.vimeoStatus) && doc.vimeoId !== previousDoc?.vimeoId) {
    await req.payload.jobs.queue({ task: 'vimeoPoll', input: { id: doc.id, vimeoId: doc.vimeoId }, req })
  }
  return doc
}

type VideoVersion = { _status?: string | null; vimeoId?: string | null; vimeoStatus?: string | null; vimeoUrl?: string | null }
/** Only videos uploaded here (a pasted Vimeo URL may be someone else's video). */
const ours = (v: VideoVersion) => (v.vimeoId && v.vimeoStatus && !v.vimeoUrl ? v.vimeoId : null)

const versionsOf = async (id: number | string, req: PayloadRequest) =>
  (
    await req.payload.findVersions({
      collection: 'videos',
      where: { parent: { equals: id } },
      sort: '-updatedAt',
      pagination: false,
      depth: 0,
      req,
    })
  ).docs.map((d) => d.version as VideoVersion)

const deleteOnVimeo = async (ids: Iterable<string>, req: PayloadRequest) => {
  if (!process.env.VIMEO_ACCESS_TOKEN) return
  for (const id of ids) {
    await vimeo({ method: 'DELETE', path: `/videos/${id}` }).catch((err) =>
      req.payload.logger.error({ err }, `Vimeo delete of ${id} failed`),
    )
  }
}

/**
 * On publish, deletes our uploads that this video replaced since the previous publish. Older ones were cleaned up by
 * that publish, so each is deleted once. Drafts never delete: the published version may still use the old video.
 */
export const deleteReplacedVimeo: CollectionAfterChangeHook = async ({ doc, req }) => {
  if (doc._status !== 'published') return doc
  const stale = new Set<string>()
  // [0] is the version this save just wrote.
  for (const v of (await versionsOf(doc.id, req)).slice(1)) {
    const id = ours(v)
    if (id && id !== doc.vimeoId) stale.add(id)
    if (v._status === 'published') break
  }
  await deleteOnVimeo(stale, req)
  return doc
}

// Versions are gone by afterDelete, so collect the uploads first and delete on Vimeo once the record is deleted.
export const collectVimeoUploads: CollectionBeforeDeleteHook = async ({ id, context, req }) => {
  context.vimeoIds = new Set((await versionsOf(id, req)).map(ours).filter(Boolean))
}
export const deleteFromVimeo: CollectionAfterDeleteHook = ({ context, req }) =>
  deleteOnVimeo((context.vimeoIds as Set<string>) ?? [], req)

/** Polls one upload every minute (re-queues itself) until Vimeo says ready or failed. */
export const vimeoPoll: TaskConfig<{ input: { id: number; vimeoId: string }; output: object }> = {
  slug: 'vimeoPoll',
  retries: 5,
  inputSchema: [
    { name: 'id', type: 'number', required: true },
    { name: 'vimeoId', type: 'text', required: true },
  ],
  handler: async ({ input, req }) => {
    const latest = await req.payload.findByID({ collection: 'videos', id: input.id, draft: true, depth: 0, req })
    if (latest.vimeoId !== input.vimeoId) return { output: {} } // the video was replaced; its own job polls the new one
    const v = await vimeo({
      path: `/videos/${input.vimeoId}`,
      query: { fields: 'duration,pictures.sizes,upload.status,transcode.status' },
    })
    const status = statusOf(v)
    if (status !== latest.vimeoStatus) {
      await req.payload.update({
        collection: 'videos',
        id: input.id,
        // Write where the editor's latest edit lives: a pending draft stays a draft, a published doc stays published.
        draft: latest._status === 'draft',
        data: {
          vimeoStatus: status,
          ...(status === 'ready' && { duration: clock(v.duration), thumbnailUrl: v.pictures?.sizes?.at(-1)?.link }),
        },
        req,
      })
    }
    if (status !== 'ready' && status !== 'failed') {
      await req.payload.jobs.queue({ task: 'vimeoPoll', input, waitUntil: new Date(Date.now() + 60_000), req })
    }
    return { output: {} }
  },
}

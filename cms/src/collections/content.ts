// The content the app shows. Everything has drafts, versions and scheduled publish; the public reads published only.
import { APIError, type Access, type CollectionConfig, type Field } from 'payload'
import {
  clock,
  collectVimeoUploads,
  deleteFromVimeo,
  deleteReplacedVimeo,
  queueVimeoPoll,
  vimeoUploadEndpoint,
} from '../vimeo'

const publishedOrStaff: Access = ({ req }) => Boolean(req.user) || { _status: { equals: 'published' } }

/** A content collection: public read of published docs, staff-only writes (Payload's default), drafts + scheduled publish. */
const content = (config: CollectionConfig): CollectionConfig => ({
  access: { read: publishedOrStaff },
  versions: { drafts: { schedulePublish: true }, maxPerDoc: 50 },
  ...config,
  admin: { group: 'Content', ...config.admin },
})

/** The app's own id for a record (the key its code uses today, e.g. video "v9", category "home"). */
const appId: Field = { name: 'appId', type: 'text', required: true, unique: true, index: true }
const text = (name: string, extra: Partial<Field> = {}) => ({ name, type: 'text', ...extra }) as Field

/** The app's expert / video kinds (VideoKind). */
const KINDS = [
  { label: 'Mortgages', value: 'mortgage' },
  { label: 'Pensions', value: 'pension' },
  { label: 'Savings & money', value: 'planner' },
  { label: 'Protection', value: 'protection' },
  { label: 'Investing', value: 'investment' },
]
const kind = (name: string, label?: string): Field => ({ name, label, type: 'select', options: KINDS, required: true })

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  admin: { useAsTitle: 'name' },
  fields: [text('name', { required: true }), text('slug', { required: true, unique: true, index: true })],
}

const Videos = content({
  slug: 'videos',
  endpoints: [vimeoUploadEndpoint],
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'kind', 'presenter', 'vimeoStatus', '_status'] },
  fields: [
    appId,
    {
      name: 'vimeoUpload',
      type: 'ui',
      admin: { components: { Field: '/components/VimeoUpload#VimeoUpload' } },
    },
    {
      name: 'vimeoStatus',
      label: 'Vimeo status',
      type: 'select',
      options: [
        { label: 'Uploading', value: 'uploading' },
        { label: 'Transcoding', value: 'transcoding' },
        { label: 'Ready', value: 'ready' },
        { label: 'Failed', value: 'failed' },
      ],
      admin: { readOnly: true, position: 'sidebar' },
    },
    text('title', { required: true }),
    kind('kind', 'Topic'),
    text('presenter', { required: true }),
    text('role'),
    text('tool', { admin: { description: 'The calculator id the video leads to (e.g. borrow).' } }),
    text('art', { admin: { description: 'The --art-* picture used before a thumbnail exists.' } }),
    text('vimeoUrl', { label: 'Vimeo URL', admin: { description: 'For a video already on Vimeo, e.g. https://vimeo.com/123456789 (leave empty when uploading a file above; a pasted URL is never deleted from Vimeo). The id, thumbnail and running time are read from Vimeo on save.' } }),
    text('vimeoId', { admin: { readOnly: true } }),
    text('thumbnailUrl', { admin: { readOnly: true } }),
    text('duration', { admin: { description: 'Running time, "1:14". Filled from Vimeo when empty.' } }),
    { name: 'mins', type: 'number', required: true },
    text('caption', { required: true, admin: { description: 'The one-line teaser on the card.' } }),
    { name: 'captions', type: 'upload', relationTo: 'media', admin: { description: '.vtt captions file' } },
    { name: 'transcript', type: 'textarea' },
    // The app's current files, for videos not yet on Vimeo.
    text('src', { admin: { description: 'App media path (until uploaded to Vimeo).' } }),
    text('poster', { admin: { description: 'App media path (until uploaded to Vimeo).' } }),
    {
      name: 'topic',
      type: 'relationship',
      relationTo: 'topics',
      admin: { description: 'The focus area it is tagged with, for focus areas that show tagged videos only.' },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, originalDoc }) => {
        if (!data.vimeoUrl || data.vimeoUrl === originalDoc?.vimeoUrl) return data
        const res = await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(data.vimeoUrl)}`)
        if (!res.ok) throw new APIError('Vimeo could not find that video. Is the URL right and embedding allowed?', 400, null, true)
        const video = await res.json()
        return {
          ...data,
          vimeoId: String(video.video_id),
          vimeoStatus: null, // marks it as not uploaded here, so it is never deleted on Vimeo
          thumbnailUrl: video.thumbnail_url,
          duration: data.duration || clock(video.duration),
        }
      },
    ],
    afterChange: [queueVimeoPoll, deleteReplacedVimeo],
    beforeDelete: [collectVimeoUploads],
    afterDelete: [deleteFromVimeo],
  },
})

const ExploreCategories = content({
  slug: 'explore-categories',
  admin: { useAsTitle: 'name' },
  fields: [appId, text('name', { required: true }), text('emoji'), text('color'), text('blurb')],
})

const Calculators = content({
  slug: 'calculators',
  admin: { useAsTitle: 'name', description: 'Intro copy only: the maths, rules and rates stay in the app.' },
  fields: [
    appId,
    text('name', { required: true }),
    text('question', { required: true, admin: { description: 'The intro line under the title.' } }),
    text('emoji'),
    { name: 'category', type: 'relationship', relationTo: 'explore-categories', required: true },
    { name: 'help', type: 'richText' },
  ],
})

const Topics = content({
  slug: 'topics',
  labels: { singular: 'Focus area', plural: 'Focus areas' },
  admin: { useAsTitle: 'name' },
  fields: [
    text('name', { required: true, unique: true }),
    text('emoji'),
    text('blurb'),
    kind('expert'),
    { name: 'category', type: 'relationship', relationTo: 'explore-categories', required: true },
    text('art'),
    text('photoPosition'),
    { name: 'tools', type: 'relationship', relationTo: 'calculators', hasMany: true },
    {
      name: 'taggedVideosOnly',
      type: 'checkbox',
      admin: { description: "Shows only the videos tagged with this focus area, not every video of its expert's kind." },
    },
    { name: 'order', type: 'number' },
  ],
})

const LiveSessions = content({
  slug: 'live-sessions',
  admin: { useAsTitle: 'title' },
  fields: [
    text('title', { required: true }),
    text('when', { required: true, admin: { description: '"Thu 7pm"' } }),
    kind('expert'),
    { name: 'onExplore', type: 'checkbox', admin: { description: 'Listed on Explore.' } },
  ],
})

const Articles = content({
  slug: 'articles',
  admin: { useAsTitle: 'title' },
  fields: [
    text('title', { required: true }),
    {
      name: 'kind',
      type: 'select',
      required: true,
      options: ['article', 'faq', 'link'].map((value) => ({ label: value, value })),
    },
    text('emoji'),
    text('photo', { admin: { description: 'The card picture: an app media file name, e.g. home-keys.' } }),
    text('url', { admin: { description: 'For links: where it goes.' } }),
    { name: 'body', type: 'richText' },
  ],
})

/** A journey on a focus area's own page (Mortgages: Buying, Switching, Borrowing more; Loans: Taking a loan, Credit cards, Several debts): its calculators, story videos, reading and live sessions. */
const Journeys = content({
  slug: 'journeys',
  labels: { singular: 'Journey', plural: 'Journeys' },
  admin: { useAsTitle: 'name' },
  fields: [
    text('name', { required: true }),
    { name: 'topic', type: 'relationship', relationTo: 'topics', required: true },
    { name: 'order', type: 'number' },
    {
      name: 'calculators',
      type: 'array',
      fields: [
        text('label', { required: true }),
        text('photo'),
        { name: 'tool', type: 'relationship', relationTo: 'calculators', required: true },
        text('emoji'),
        text('name', { admin: { description: "Shown instead of the calculator's own name." } }),
      ],
    },
    {
      name: 'stories',
      type: 'array',
      fields: [
        text('short', { required: true }),
        text('title', { required: true }),
        text('duration'),
        text('color'),
        text('emoji'),
        text('tool'),
        text('photo', { admin: { description: 'The thumbnail before there is a filmed video (app media file name); without one a stock photo and the emoji show.' } }),
        text('chapters', { hasMany: true }),
        { name: 'video', type: 'relationship', relationTo: 'videos', admin: { description: 'The filmed video, once there is one.' } },
      ],
    },
    { name: 'reading', type: 'relationship', relationTo: 'articles', hasMany: true },
    { name: 'live', type: 'relationship', relationTo: 'live-sessions', hasMany: true },
  ],
})

const AskAnswers = content({
  slug: 'ask-answers',
  admin: { useAsTitle: 'question', description: 'Plain-English help, never advice.' },
  fields: [
    { ...appId, name: 'key' } as Field,
    text('question', { required: true }),
    { name: 'answer', type: 'richText', required: true },
    { name: 'order', type: 'number' },
  ],
})

const PersonalityTypes = content({
  slug: 'personality-types',
  admin: { useAsTitle: 'name' },
  fields: [
    { ...appId, name: 'code', admin: { description: 'A, B, E or C (the app scores answers to these codes).' } } as Field,
    text('name', { required: true }),
    text('emoji'),
    text('strapline'),
    text('strengths', { hasMany: true }),
    text('watchOut'),
  ],
})

const LegalPages = content({
  slug: 'legal-pages',
  admin: { useAsTitle: 'title' },
  fields: [
    text('title', { required: true }),
    text('slug', { required: true, index: true }),
    text('version', {
      required: true,
      admin: { description: 'Must match the consent version the app records (NOTICE_VERSION, e.g. 2026-10).' },
    }),
    { name: 'body', type: 'richText', required: true },
  ],
})

export const CONTENT = [
  Videos,
  Topics,
  ExploreCategories,
  Calculators,
  LiveSessions,
  Articles,
  Journeys,
  AskAnswers,
  PersonalityTypes,
  LegalPages,
]

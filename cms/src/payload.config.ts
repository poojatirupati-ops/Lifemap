import { postgresAdapter } from '@payloadcms/db-postgres'
import { multiTenantPlugin } from '@payloadcms/plugin-multi-tenant'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { CONTENT, Tenants } from './collections/content'
import { vimeoPoll } from './vimeo'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Tenants, ...CONTENT],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  // The app's origins (comma list: dev server, vite preview); the app only GETs published content.
  cors: (process.env.CMS_CORS_ORIGINS || 'http://localhost:5173,http://localhost:4173').split(','),
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    schemaName: 'cms', // own schema, so it can share the API's Postgres
  }),
  // Scheduled publish and Vimeo polling (vimeoPoll) run as jobs: every minute in dev / `next start`; on Lambda the CmsJobs cron calls /api/payload-jobs/run.
  jobs: {
    access: {
      run: ({ req }) =>
        Boolean(req.user) ||
        (!!process.env.CRON_SECRET &&
          req.headers.get('authorization') === `Bearer ${process.env.CRON_SECRET}`),
    },
    tasks: [vimeoPoll],
    autoRun: process.env.CRON_SECRET ? [] : [{ cron: '* * * * *', queue: 'default' }],
  },
  sharp,
  plugins: [
    // Production only (S3_BUCKET set by SST); dev keeps files on local disk under cms/media.
    // clientUploads: the admin PUTs the file to S3 with a presigned URL, so it never passes through the CMS (Lambda).
    // Reads: file URLs point at CloudFront (MEDIA_URL, the bucket on the app origin), so /api/media/file is never used.
    s3Storage({
      enabled: Boolean(process.env.S3_BUCKET),
      clientUploads: true,
      collections: {
        media: {
          disablePayloadAccessControl: true,
          // No prefix is configured, so the object key is the filename.
          generateFileURL: ({ filename }) =>
            `${process.env.MEDIA_URL}/${encodeURIComponent(filename)}`,
        },
      },
      bucket: process.env.S3_BUCKET || '',
      config: { region: process.env.AWS_REGION || 'eu-west-1' },
    }),
    multiTenantPlugin({
      collections: Object.fromEntries(
        ['media', ...CONTENT.map((c) => c.slug)].map((slug) => [slug, {}]),
      ),
      // Every staff user is LifeMap staff and sees all tenants.
      userHasAccessToAllTenants: () => true,
    }),
  ],
})

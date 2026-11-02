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
  // The app's origins (comma list); the app only GETs published content.
  cors: (process.env.CMS_CORS_ORIGINS || 'http://localhost:5173').split(','),
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    schemaName: 'cms', // own schema, so it can share the API's Postgres
  }),
  // Scheduled publish runs as a job: every minute in dev / `next start`; on Lambda the CmsJobs cron calls /api/payload-jobs/run.
  jobs: {
    access: {
      run: ({ req }) =>
        Boolean(req.user) ||
        (!!process.env.CRON_SECRET &&
          req.headers.get('authorization') === `Bearer ${process.env.CRON_SECRET}`),
    },
    autoRun: process.env.CRON_SECRET ? [] : [{ cron: '* * * * *', queue: 'default' }],
  },
  sharp,
  plugins: [
    // Production only (S3_BUCKET set by SST); dev keeps files on local disk under cms/media.
    s3Storage({
      enabled: Boolean(process.env.S3_BUCKET),
      collections: { media: true },
      bucket: process.env.S3_BUCKET || '',
      config: { region: process.env.AWS_REGION || 'eu-west-1' },
    }),
    multiTenantPlugin({
      collections: Object.fromEntries(['media', ...CONTENT.map((c) => c.slug)].map((slug) => [slug, {}])),
      // ponytail: every staff user is LifeMap staff and sees all tenants; add a role check when credit-union editors get logins.
      userHasAccessToAllTenants: () => true,
    }),
  ],
})

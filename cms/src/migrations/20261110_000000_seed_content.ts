import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'
import { hasContent, seedContent } from '../seed/load'

// The starting content (src/seed/content.json) for a CMS that has none: a new stage, or one deployed before this
// migration. A CMS that already has content is left alone, so editors' work is never replaced.
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  if (await hasContent(payload, req))
    return payload.logger.info('CMS already has content: seed skipped')
  await seedContent(payload, req)
}

/** Nothing is removed: by now editors may have changed the seeded content. */
export async function down(_args: MigrateDownArgs): Promise<void> {}

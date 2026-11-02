import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

// The Vimeo change dropped the videos' `file` upload: a video is a Vimeo upload or an app media path (`src`).
// A file still attached is kept as its media URL in `src` before the column goes.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(`
    UPDATE cms.videos v SET src = m.url
      FROM cms.media m WHERE v.file_id = m.id AND coalesce(v.src, '') = '';
    UPDATE cms._videos_v v SET version_src = m.url
      FROM cms.media m WHERE v.version_file_id = m.id AND coalesce(v.version_src, '') = '';
    ALTER TABLE cms.videos DROP CONSTRAINT IF EXISTS videos_file_id_media_id_fk;
    DROP INDEX IF EXISTS cms.videos_file_idx;
    ALTER TABLE cms.videos DROP COLUMN IF EXISTS file_id;
    ALTER TABLE cms._videos_v DROP CONSTRAINT IF EXISTS _videos_v_version_file_id_media_id_fk;
    DROP INDEX IF EXISTS cms._videos_v_version_version_file_idx;
    ALTER TABLE cms._videos_v DROP COLUMN IF EXISTS version_file_id;
  `)
}

/** The columns come back empty: the files stay in `src`. */
export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(`
    ALTER TABLE cms.videos ADD COLUMN file_id integer
      REFERENCES cms.media(id) ON DELETE SET NULL;
    CREATE INDEX videos_file_idx ON cms.videos (file_id);
    ALTER TABLE cms._videos_v ADD COLUMN version_file_id integer
      REFERENCES cms.media(id) ON DELETE SET NULL;
    CREATE INDEX _videos_v_version_version_file_idx ON cms._videos_v (version_file_id);
  `)
}

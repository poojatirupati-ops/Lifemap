import * as migration_20261101_000000_initial from './20261101_000000_initial';
import * as migration_20261102_000000_keep_video_files from './20261102_000000_keep_video_files';

export const migrations = [
  {
    up: migration_20261101_000000_initial.up,
    down: migration_20261101_000000_initial.down,
    name: '20261101_000000_initial',
  },
  {
    up: migration_20261102_000000_keep_video_files.up,
    down: migration_20261102_000000_keep_video_files.down,
    name: '20261102_000000_keep_video_files',
  },
];

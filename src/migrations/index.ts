import * as migration_20261108_005153_initial from './20261108_005153_initial';
import * as migration_20261108_153129_media_storage from './20261108_153129_media_storage';

export const migrations = [
  {
    up: migration_20261108_005153_initial.up,
    down: migration_20261108_005153_initial.down,
    name: '20261108_005153_initial',
  },
  {
    up: migration_20261108_153129_media_storage.up,
    down: migration_20261108_153129_media_storage.down,
    name: '20261108_153129_media_storage'
  },
];

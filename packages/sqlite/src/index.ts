import { SQLiteStorageFactory } from '@lib/sqlite-storage';
import { storage } from '@quantform/core';

export * from '@lib/sqlite-storage';

export function sqlite(directory?: string) {
  return storage(new SQLiteStorageFactory(directory));
}

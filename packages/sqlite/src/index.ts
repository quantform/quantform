import { SQLiteStorageFactory } from '@lib/sqlite-storage';
import { useStorageFactory } from '@quantform/core';

export * from '@lib/sqlite-storage';

export function sqlite(directory?: string) {
  return useStorageFactory.options(new SQLiteStorageFactory(directory));
}

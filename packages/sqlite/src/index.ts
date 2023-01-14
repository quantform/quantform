import { Dependency, StorageFactoryToken } from '@quantform/core';

import { SQLiteStorageFactory } from '@lib/sqlite-storage';

export * from '@lib/sqlite-storage';

export function withSqlLite(directory?: string): Dependency[] {
  return [
    {
      provide: StorageFactoryToken,
      useValue: new SQLiteStorageFactory(directory)
    }
  ];
}

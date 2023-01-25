import { SQLiteStorageFactory } from '@lib/sqlite-storage';
import { Dependency, StorageFactoryToken } from '@quantform/core';

export * from '@lib/sqlite-storage';

export function withSqlLite(directory?: string): Dependency[] {
  return [
    {
      provide: StorageFactoryToken,
      useValue: new SQLiteStorageFactory(directory)
    }
  ];
}

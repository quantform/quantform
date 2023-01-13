import { ModuleDefinition, StorageFactoryToken } from '@quantform/core';

import { SQLiteStorageFactory } from '@lib/sqlite-storage';

export * from '@lib/sqlite-storage';

export function withSqlStorage(directory?: string): ModuleDefinition {
  return {
    dependencies: [
      {
        provide: StorageFactoryToken,
        useValue: new SQLiteStorageFactory(directory)
      }
    ]
  };
}

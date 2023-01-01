export * from '@lib/storage/feed';
export * from '@lib/storage/measurement';
export * from '@lib/storage/storage';
export * from '@lib/storage/cache';

import { ModuleDefinition, useModule } from '@lib/module';
import {
  Cache,
  Feed,
  InMemoryStorageFactory,
  Measurement,
  storageFactoryToken
} from '@lib/storage';

export function useCache() {
  return useModule().get(Cache);
}

export function useFeed() {
  return useModule().get(Feed);
}

export function useMeasurement() {
  return useModule().get(Measurement);
}

export function storage(): ModuleDefinition {
  return {
    dependencies: [
      { provide: Cache },
      { provide: Feed },
      { provide: Measurement },
      { provide: storageFactoryToken, useClass: InMemoryStorageFactory }
    ]
  };
}

export * from '@lib/storage/feed';
export * from '@lib/storage/measurement';
export * from '@lib/storage/storage';
export * from '@lib/storage/cache';

import { ModuleDefinition } from '@lib/module';
import { useProvider } from '@lib/shared';
import {
  Cache,
  Feed,
  InMemoryStorageFactory,
  Measurement,
  storageFactoryToken
} from '@lib/storage';

export function useCache() {
  return useProvider<Cache>(Cache);
}

export function useFeed() {
  return useProvider<Feed>(Feed);
}

export function useMeasurement() {
  return useProvider<Measurement>(Measurement);
}

export function storage(): ModuleDefinition {
  return {
    providers: [
      { provide: Cache },
      { provide: Feed },
      { provide: Measurement },
      { provide: storageFactoryToken, useClass: InMemoryStorageFactory }
    ]
  };
}

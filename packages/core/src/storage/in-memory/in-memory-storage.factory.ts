import { provider } from '@lib/module';
import { Storage, StorageFactory } from '@lib/storage';

import { InMemoryStorage } from './in-memory-storage';

@provider()
export class InMemoryStorageFactory implements StorageFactory {
  private static storage: Record<string, Storage> = {};

  for(key: string): Storage {
    return (
      InMemoryStorageFactory.storage[key] ??
      (InMemoryStorageFactory.storage[key] = new InMemoryStorage())
    );
  }
}

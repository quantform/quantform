import { Storage, StorageQueryOptions } from './storage';

export class Cache {
  constructor(private readonly storage: Storage) {}

  tryGet<T>(key: string, getter: () => Promise<T>): Promise<T> {
    return getter();
  }
}

import { provide, provider } from '@lib/module';
import { now } from '@lib/shared';
import { Storage, StorageFactory, storageFactoryToken } from '@lib/storage';

@provider()
export class Cache {
  private readonly storage: Storage;

  constructor(@provide(storageFactoryToken) factory: StorageFactory) {
    this.storage = factory.for('cache');
  }

  async tryGet<T>(
    getter: () => Promise<T>,
    options: { key: string; ttl?: number }
  ): Promise<T> {
    const time = now();

    const payload = await this.storage.query(options.key, {
      kind: 'cache',
      count: 1,
      to: time + 1
    });

    const ttl = options.ttl ?? 60 * 60 * 24;

    if (!payload.length || payload[0].timestamp < time - ttl) {
      const value = await getter();

      await this.storage.save(options.key, [
        {
          timestamp: time,
          kind: 'cache',
          json: JSON.stringify(value)
        }
      ]);

      return value;
    }

    return JSON.parse(payload[0].json);
  }
}

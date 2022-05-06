import { now } from '../shared';
import { Storage } from './storage';

export class Cache {
  constructor(private readonly storage: Storage) {}

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

    if ((!payload.length || payload[0].timestamp < time - options.ttl) ?? 60 * 60 * 24) {
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

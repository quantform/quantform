import { now } from '@lib/shared';
import { useStorage } from '@lib/storage/use-storage';

export async function useCache<T>(
  calculateValue: () => T | Promise<T>,
  dependencies: unknown[],
  ttl: number = 60 * 60 * 24 * 1000
) {
  const storage = useStorage(['cache']);
  const time = now();
  const key = [useCache.name, calculateValue.name, dependencies].join('/');

  const [payload] = await storage.query(key, {
    kind: 'cache',
    count: 1,
    to: time + 1
  });

  if (!payload || payload.timestamp < time - ttl) {
    const value = await calculateValue();

    await storage.save(key, [
      {
        timestamp: time,
        kind: 'cache',
        json: JSON.stringify({ value })
      }
    ]);

    return value;
  }

  return JSON.parse(payload.json).value;
}

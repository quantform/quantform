import { StorageQueryOptions } from '@lib/storage';
import { useStorage } from '@lib/storage/useStorage';
import { useHash } from '@lib/useHash';

export function useSampler<T extends { timestamp: number }>(dependencies: unknown[]) {
  const read = useSampleReader<T>(dependencies);
  const write = useSampleWriter<T>(dependencies);

  return { read, write };
}

function useSampleWriter<T extends { timestamp: number }>(dependencies: unknown[]) {
  const storage = useStorage(['samples']);
  const key = useHash(dependencies);

  return (samples: T[]) =>
    storage.save(
      key,
      samples.map(it => ({
        timestamp: it.timestamp,
        kind: 'sample',
        json: JSON.stringify(it)
      }))
    );
}

function useSampleReader<T extends { timestamp: number }>(dependencies: unknown[]) {
  const storage = useStorage(['samples']);
  const key = useHash(dependencies);

  return async (options: Omit<StorageQueryOptions, 'kind'>) =>
    (
      await storage.query(key, {
        kind: 'sample',
        ...options
      })
    ).map(
      it =>
        ({
          timestamp: it.timestamp,
          ...JSON.parse(it.json)
        } as T)
    );
}

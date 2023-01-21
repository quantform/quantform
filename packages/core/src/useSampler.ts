import { StorageQueryOptions } from '@lib/storage';
import { useStorage } from '@lib/storage/useStorage';
import { useHash } from '@lib/useHash';

export function useSampler<T>(dependencies: unknown[]) {
  const read = useSampleReader<T>(dependencies);
  const write = useSampleWriter<T>(dependencies);

  return { read, write };
}

function useSampleWriter<T>(dependencies: unknown[]) {
  const storage = useStorage(['samples']);
  const key = useHash(dependencies);

  return (samples: { timestamp: number; payload: T }[]) =>
    storage.save(
      key,
      samples.map(it => ({
        kind: 'sample',
        timestamp: it.timestamp,
        json: JSON.stringify(it.payload)
      }))
    );
}

function useSampleReader<T>(dependencies: unknown[]) {
  const storage = useStorage(['samples']);
  const key = useHash(dependencies);

  return async (options: Omit<StorageQueryOptions, 'kind'>) =>
    (
      await storage.query(key, {
        kind: 'sample',
        ...options
      })
    ).map(it => ({
      timestamp: it.timestamp,
      payload: JSON.parse(it.json) as T
    }));
}

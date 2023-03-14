import { StorageQueryOptions } from '@lib/storage';
import { dependency, useHash } from '@lib/use-hash';

import { useReplayStorage } from './use-replay-storage';

export function useReplayReader<T>(dependencies: dependency[]) {
  const storage = useReplayStorage();
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

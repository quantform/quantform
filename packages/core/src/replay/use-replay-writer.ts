import { dependency, useHash } from '@lib/use-hash';

import { useReplayStorage } from './use-replay-storage';

export function useReplayWriter<T>(dependencies: dependency[]) {
  const storage = useReplayStorage();
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

import { dependency, useHash } from '@lib/use-hash';

import { replaySerializableObject, useReplayStorage } from './use-replay-storage';

export function useReplayWriter<T>(dependencies: dependency[]) {
  const storage = useReplayStorage();
  const key = useHash(dependencies);

  return (samples: { timestamp: number; payload: T }[]) =>
    storage.save(
      replaySerializableObject(key),
      samples.map(it => ({
        timestamp: it.timestamp,
        json: JSON.stringify(it.payload)
      }))
    );
}

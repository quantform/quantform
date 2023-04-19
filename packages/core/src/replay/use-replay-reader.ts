import { Query, QueryObject } from '@lib/storage';
import { dependency, useHash } from '@lib/use-hash';

import { replaySerializableObject, useReplayStorage } from './use-replay-storage';

export function useReplayReader<T>(dependencies: dependency[]) {
  const storage = useReplayStorage();
  const key = useHash(dependencies);

  return async (query: Query<QueryObject>) =>
    (
      await storage.query(replaySerializableObject(key), {
        where: {
          timestamp: query.where?.timestamp
        },
        limit: query.limit,
        orderBy: query.orderBy
      })
    ).map(it => ({
      timestamp: it.timestamp,
      payload: JSON.parse(it.json) as T
    }));
}

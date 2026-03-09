import { hashCode } from '@lib/hash-code';
import {
  eq,
  InferQueryObject,
  Query,
  QueryObject,
  QueryObjectType,
  Storage,
  useStorage
} from '@lib/storage';
import { Uri } from '@lib/uri';

import { BacktestStorage } from './use-backtest';

export type BacktestStorageQuery<V> = {
  sync: <T extends QueryObjectType<K>, K extends QueryObject>(
    query: Query<InferQueryObject<T>> & {
      where: { timestamp: { type: 'between'; min: number; max: number } };
    },
    storage: { save: (objects: { timestamp: number; payload: V }[]) => Promise<void> }
  ) => Promise<void>;
};

const storageIndexObject = Storage.createObject('index://range', {
  timestamp: 'number',
  uri: 'string',
  min: 'number',
  max: 'number'
});

export function useBacktestStorage<V, P extends Record<string, string | number>>(
  uri: Uri<P>,
  { sync }: BacktestStorageQuery<V>
): BacktestStorage<V> {
  const storage = useStorage(['backtest']);
  const storageObjectKey = uri.query;
  const storageObject = Storage.createObject(storageObjectKey, {
    timestamp: 'number',
    payload: 'string'
  });

  const id = hashCode(storageObjectKey);

  return {
    async query(query) {
      const [index] = await storage.query(storageIndexObject, {
        limit: 1,
        where: { timestamp: eq(id) }
      });

      const { min, max } = query.where.timestamp;

      if (!index || min < index.min || max > index.max) {
        await sync(query, {
          async save(objects) {
            await storage.save(
              storageObject,
              objects.map(it => ({
                timestamp: it.timestamp,
                payload: JSON.stringify(it.payload)
              }))
            );
          }
        });

        await storage.save(storageIndexObject, [
          {
            timestamp: id,
            max,
            min,
            uri: storageObjectKey
          }
        ]);
      }

      return (await storage.query(storageObject, query)).map(it => ({
        timestamp: it.timestamp,
        payload: JSON.parse(it.payload) as V
      }));
    }
  };
}

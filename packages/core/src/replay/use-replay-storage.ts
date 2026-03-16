import { share } from 'rxjs';

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
import { useLogger } from '@lib/use-logger';
import { useMemo } from '@lib/use-memo';

import { useReplayOptions } from './use-replay-options';
import { useReplayScheduler } from './use-replay-scheduler';

export type ReplayStorageQuery<V> = {
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

export function useReplayStorage<V, P extends Record<string, string | number>>(
  uri: Uri<P>,
  { sync }: ReplayStorageQuery<V>
) {
  const { watch } = useReplayScheduler();
  const { info } = useLogger(useReplayStorage.name);
  const options = useReplayOptions();
  const storage = useStorage([options.storage]);
  const storageObjectKey = uri.query;
  const storageObject = Storage.createObject(storageObjectKey, {
    timestamp: 'number',
    payload: 'string'
  });

  const id = hashCode(storageObjectKey);

  return {
    watch: () =>
      useMemo(
        () =>
          watch({
            async query(query) {
              const [index] = await storage.query(storageIndexObject, {
                limit: 1,
                where: { timestamp: eq(id) }
              });

              const { min, max } = query.where.timestamp;

              if (!index || min < index.min || max > index.max) {
                info(`fetching replay for ${storageObjectKey} started`);

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

                info(`fetching replay for ${storageObjectKey} finished`);
              }

              return (await storage.query(storageObject, query)).map(it => ({
                timestamp: it.timestamp,
                payload: JSON.parse(it.payload) as V
              }));
            }
          }).pipe(share()),
        [useReplayStorage.name, storageObjectKey]
      )
  };
}

import { Query, QueryObject, Storage, useStorage } from '@lib/storage';
import { dependency, useHash } from '@lib/use-hash';

export function useReplayStorage<T>(dependencies: dependency[]) {
  const storage = useStorage(['replay']);
  const storageObjectKey = useHash(dependencies);
  const storageObject = Storage.createObject(storageObjectKey, {
    timestamp: 'number',
    payload: 'string'
  });

  return {
    async query(query: Query<QueryObject>) {
      return (await storage.query(storageObject, query)).map(it => ({
        timestamp: it.timestamp,
        payload: JSON.parse(it.payload) as T
      }));
    },
    save(objects: { timestamp: number; payload: T }[]) {
      return storage.save(
        storageObject,
        objects.map(it => ({
          timestamp: it.timestamp,
          payload: JSON.stringify(it.payload)
        }))
      );
    }
  };
}

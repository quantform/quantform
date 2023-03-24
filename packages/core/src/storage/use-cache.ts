import { from, map, Observable, of, switchMap } from 'rxjs';

import { now } from '@lib/shared';
import { useStorage } from '@lib/storage/use-storage';
import { dependency, useHash } from '@lib/use-hash';

import { eq, gt, serializableObject } from './storage';

const cacheObject = serializableObject<{
  timestamp: number;
  key: string;
  json: string;
}>('cache');

export function useCache<T>(
  calculateValue: Observable<T>,
  dependencies: dependency[],
  ttl: number = 60 * 60 * 24 * 1000
): Observable<T> {
  const storage = useStorage(['cache']);
  const key = useHash(dependencies);
  const timestamp = now();

  return from(
    storage.query(cacheObject, {
      where: {
        timestamp: gt(timestamp - ttl),
        key: eq(key)
      },
      limit: 1,
      orderBy: 'DESC'
    })
  ).pipe(
    switchMap(([value]) => {
      if (value) {
        return of(JSON.parse(value.json));
      }

      return calculateValue.pipe(
        switchMap(newValue =>
          from(
            storage.save(cacheObject, [
              { timestamp, key, json: JSON.stringify(newValue) }
            ])
          ).pipe(map(() => newValue))
        )
      );
    })
  );
}

import { from, map, Observable, of, switchMap } from 'rxjs';

import { now } from '@lib/shared';
import { useStorage } from '@lib/storage/use-storage';
import { dependency, useHash } from '@lib/use-hash';

import { eq, gt, Storage } from './storage';

const object = Storage.createObject('keyValue', {
  timestamp: 'number',
  forKey: 'string',
  rawJson: 'string'
});

export const useCache = <T>(
  calculateValue: Observable<T>,
  dependencies: dependency[],
  ttl: number = 60 * 60 * 24 * 1000
): Observable<T> => {
  const storage = useStorage(['cache']);
  const key = useHash(dependencies);
  const timestamp = now();

  return from(
    storage.query(object, {
      where: {
        timestamp: gt(timestamp - ttl),
        forKey: eq(key)
      },
      limit: 1,
      orderBy: 'DESC'
    })
  ).pipe(
    switchMap(([value]) => {
      if (value) {
        return of(JSON.parse(value.rawJson));
      }

      return calculateValue.pipe(
        switchMap(newValue =>
          from(
            storage.save(object, [
              { timestamp, forKey: key, rawJson: JSON.stringify(newValue) }
            ])
          ).pipe(map(() => newValue))
        )
      );
    })
  );
};

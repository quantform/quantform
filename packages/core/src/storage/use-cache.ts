import { from, map, Observable, of, switchMap } from 'rxjs';

import { useStorage } from '@lib/storage/use-storage';
import { dependency, useHash } from '@lib/use-hash';
import { now } from '@lib/use-timestamp';

import { eq, gt, Storage } from './storage';

const object = Storage.createObject('keyValue', {
  timestamp: 'bigint',
  forKey: 'string',
  rawJson: 'string'
});

export const useCache = <T>(
  calculateValue: Observable<T>,
  dependencies: dependency[],
  ttl = BigInt(60 * 60 * 24 * 1000000)
): Observable<T> => {
  const storage = useStorage(['cache']);
  const key = useHash(dependencies);
  const timestamp = now();

  return from(
    storage.query(object, {
      where: {
        timestamp: gt(timestamp - BigInt(ttl)),
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

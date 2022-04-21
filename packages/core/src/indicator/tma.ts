import { map, Observable, share } from 'rxjs';

import { swma } from './swma';
import { wma } from './wma';

export function tma<T>(length: number, fn: (it: T) => number) {
  return function (source: Observable<T>): Observable<[T, number]> {
    return source.pipe(
      wma(length, fn),
      swma(([, it]) => it),
      map(([[it], swma]) => {
        const tuple: [T, number] = [it, swma];

        return tuple;
      }),
      share()
    );
  };
}

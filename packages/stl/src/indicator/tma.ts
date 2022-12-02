import { map, Observable, share } from 'rxjs';

import { decimal } from '@quantform/core';

import { swma, wma } from '@lib/indicator';

export function tma<T>(length: number, fn: (it: T) => decimal) {
  return function (source: Observable<T>): Observable<[T, decimal]> {
    return source.pipe(
      wma(length, fn),
      swma(([, it]) => it),
      map(([[it], swma]) => {
        const tuple: [T, decimal] = [it, swma];

        return tuple;
      }),
      share()
    );
  };
}

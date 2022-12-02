import { filter, map, Observable, share } from 'rxjs';

import { d, decimal } from '@quantform/core';

import { window } from '@lib/indicator';

export function minMax<T>(length: number, fn: (it: T) => decimal) {
  return function (
    source: Observable<T>
  ): Observable<[T, { min: decimal; max: decimal }]> {
    return source.pipe(
      window(length, fn),
      filter(([, buffer]) => buffer.isFull),
      map(([it, buffer]) => {
        let min = d.Zero;
        let max = d.Zero;

        buffer.forEach(it => {
          min = decimal.min(it, min);
          max = decimal.max(it, max);
        });
        const tuple: [T, { min: decimal; max: decimal }] = [it, { min, max }];

        return tuple;
      }),
      share()
    );
  };
}

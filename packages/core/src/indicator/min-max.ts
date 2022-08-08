import { filter, map, Observable, share } from 'rxjs';

import { decimal } from '../shared';
import { window } from './window';

export function minMax<T>(length: number, fn: (it: T) => decimal) {
  return function (
    source: Observable<T>
  ): Observable<[T, { min: decimal; max: decimal }]> {
    return source.pipe(
      window(length, fn),
      filter(([, buffer]) => buffer.isFull),
      map(([it, buffer]) => {
        let min = new decimal(0);
        let max = new decimal(0);

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

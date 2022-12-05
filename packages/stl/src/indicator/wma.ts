import { filter, map, Observable, share } from 'rxjs';

import { d, decimal } from '@quantform/core';

import { window } from '@lib/indicator';

export function wma<T>(length: number, fn: (it: T) => decimal) {
  return function (source: Observable<T>): Observable<[T, decimal]> {
    return source.pipe(
      window(length, fn),
      filter(([, buffer]) => buffer.isFull),
      map(([it, buffer]) => {
        let norm = d(0.0);
        let sum = d(0.0);

        for (let i = 0; i < buffer.capacity; i++) {
          const weight = (buffer.capacity - i) * buffer.capacity;

          norm = norm.add(weight);
          sum = sum.add(buffer.at(buffer.capacity - (i + 1)).mul(weight));
        }

        const tuple: [T, decimal] = [it, sum.div(norm)];

        return tuple;
      }),
      share()
    );
  };
}

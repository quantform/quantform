import { filter, map, Observable, share } from 'rxjs';

import { decimal } from '../shared';
import { window } from './window';

export function wma<T>(length: number, fn: (it: T) => decimal) {
  return function (source: Observable<T>): Observable<[T, decimal]> {
    return source.pipe(
      window(length, fn),
      filter(([, buffer]) => buffer.isFull),
      map(([it, buffer]) => {
        let norm = new decimal(0.0);
        let sum = new decimal(0.0);

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

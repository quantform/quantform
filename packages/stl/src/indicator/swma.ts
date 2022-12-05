import { filter, map, Observable, share } from 'rxjs';

import { d, decimal } from '@quantform/core';

import { window } from '@lib/indicator';

export function swma<T>(fn: (it: T) => decimal) {
  return function (source: Observable<T>): Observable<[T, decimal]> {
    return source.pipe(
      window(4, fn),
      filter(([, buffer]) => buffer.isFull),
      map(([it, buffer]) => {
        const x3 = buffer.at(buffer.capacity - (3 + 1));
        const x2 = buffer.at(buffer.capacity - (2 + 1));
        const x1 = buffer.at(buffer.capacity - (1 + 1));
        const x0 = buffer.at(buffer.capacity - (0 + 1));

        const value = d.Zero.plus(x3.mul(1).div(6))
          .plus(x2.mul(2).div(6))
          .plus(x1.mul(2).div(6))
          .plus(x0.mul(1).div(6));

        const tuple: [T, decimal] = [it, value];
        return tuple;
      }),
      share()
    );
  };
}

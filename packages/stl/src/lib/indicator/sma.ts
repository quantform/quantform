import { d, decimal } from '@quantform/core';
import { filter, map, Observable, share, tap } from 'rxjs';

import { window } from './window';

export function sma<T>(length: number, fn: (it: T) => decimal) {
  return function (source: Observable<T>): Observable<[T, decimal]> {
    let accumulated = d.Zero;

    return source.pipe(
      window(length, fn),
      tap(
        ([, , added, removed]) =>
          (accumulated = accumulated.add(added).minus(removed ?? 0))
      ),
      filter(([, buffer]) => buffer.isFull),
      map(([it, buffer]) => {
        const tuple: [T, decimal] = [it, accumulated.div(buffer.size)];

        return tuple;
      }),
      share()
    );
  };
}

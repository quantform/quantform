import { map, Observable, share } from 'rxjs';

import { decimal, Ohlc } from '@quantform/core';

export function trueRange<T>(fn: (it: T) => Ohlc) {
  return function (source: Observable<T>): Observable<[T, decimal]> {
    return source.pipe(
      map(it => {
        const current = fn(it);

        const value = current.high.minus(current.low);

        const tuple: [T, decimal] = [it, value];

        return tuple;
      }),
      share()
    );
  };
}

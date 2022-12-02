import { map, Observable, share } from 'rxjs';

import { decimal, Ohlc } from '@quantform/core';

export function trueRange<T>(fn: (it: T) => Ohlc) {
  return function (source: Observable<T>): Observable<[T, decimal]> {
    let previous: Ohlc;

    return source.pipe(
      map(it => {
        const current = fn(it);

        const value =
          previous == null
            ? current.high.minus(current.low)
            : decimal.max(
                decimal.max(
                  current.high.minus(current.low),
                  decimal.abs(current.high.minus(previous.close))
                ),
                decimal.abs(current.low.minus(previous.close))
              );

        const tuple: [T, decimal] = [it, value];

        return tuple;
      }),
      share()
    );
  };
}

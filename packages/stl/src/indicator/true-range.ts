import { Candle, decimal } from '@quantform/core';
import { map, Observable, share } from 'rxjs';

export function trueRange<T>(fn: (it: T) => Candle) {
  return function (source: Observable<T>): Observable<[T, decimal]> {
    let previous: Candle;

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
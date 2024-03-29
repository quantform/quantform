import { map, Observable, share } from 'rxjs';

import { decimal, Ohlc } from '@quantform/core';

import { rma, trueRange } from '@lib/indicator';

export function atr<T>(length: number, fn: (it: T) => Ohlc) {
  return function (source: Observable<T>): Observable<[T, decimal]> {
    return source.pipe(
      trueRange(fn),
      rma(length, ([, tr]) => tr),
      map(([[it], tr]) => {
        const tuple: [T, decimal] = [it, tr];

        return tuple;
      }),
      share()
    );
  };
}

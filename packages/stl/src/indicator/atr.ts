import { Candle, decimal } from '@quantform/core';
import { map, Observable, share } from 'rxjs';

import { rma } from './rma';
import { trueRange } from './true-range';

export function atr<T>(length: number, fn: (it: T) => Candle) {
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

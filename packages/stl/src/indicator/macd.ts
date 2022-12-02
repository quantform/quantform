import { map, Observable, share, withLatestFrom } from 'rxjs';

import { decimal } from '@quantform/core';

import { ema } from '@lib/indicator';

export function macd<T>(
  fast: number,
  slow: number,
  length: number,
  fn: (it: T) => decimal
) {
  return function (source: Observable<T>): Observable<decimal> {
    source = source.pipe(share());

    return source.pipe(
      withLatestFrom(source.pipe(ema(fast, fn)), source.pipe(ema(slow, fn))),
      ema(length, it => it[1][1].minus(it[2][1])),
      map(([, macd]) => macd),
      share()
    );
  };
}

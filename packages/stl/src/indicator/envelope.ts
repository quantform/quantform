import { map, Observable, share } from 'rxjs';

import { decimal } from '@quantform/core';

import { sma } from '@lib/indicator';

export function envelope<T>(
  length: number,
  percent: number,
  valueFn: (it: T) => decimal
) {
  return function (source: Observable<T>): Observable<{ min: decimal; max: decimal }> {
    return source.pipe(
      sma(length, valueFn),
      map(([, sma]) => {
        const offset = sma.mul(percent).div(100);

        return {
          min: sma.minus(offset),
          max: sma.add(offset)
        };
      }),
      share()
    );
  };
}

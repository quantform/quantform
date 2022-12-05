import { map, Observable, share } from 'rxjs';

import { d, decimal } from '@quantform/core';

import { sma } from '@lib/indicator';

export function ema<T>(length: number, fn: (it: T) => decimal) {
  return function (source: Observable<T>): Observable<[T, decimal]> {
    const alpha = d(2.0).div(d(length + 1));
    let value: decimal | undefined = undefined;

    return source.pipe(
      sma(length, fn),
      map(([it, sma]) => {
        if (!value) {
          value = sma;
        } else {
          value = alpha.mul(fn(it)).plus(d(1.0).minus(alpha).mul(value));
        }

        const tuple: [T, decimal] = [it, value];

        return tuple;
      }),
      share()
    );
  };
}

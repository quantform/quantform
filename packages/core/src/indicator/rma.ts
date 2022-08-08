import { map, Observable, share } from 'rxjs';

import { decimal } from '../shared';
import { sma } from '.';

export function rma<T>(length: number, fn: (it: T) => decimal) {
  return function (source: Observable<T>): Observable<[T, decimal]> {
    const alpha = new decimal(1.0).div(length);
    let value: decimal = null;

    return source.pipe(
      sma(length, fn),
      map(([it, sma]) => {
        if (!value) {
          value = sma;
        } else {
          value = alpha.mul(fn(it)).plus(new decimal(1.0).minus(alpha).mul(value));
        }

        const tuple: [T, decimal] = [it, value];
        return tuple;
      }),
      share()
    );
  };
}

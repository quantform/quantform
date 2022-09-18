import { d, decimal } from '@quantform/core';
import { map, Observable, share } from 'rxjs';

export function drawdown<T>(fn: (it: T) => decimal) {
  return function (source: Observable<T>): Observable<decimal> {
    let rate: decimal;
    let max = d.Zero;

    return source.pipe(
      map(it => {
        const value = fn(it);

        if (!rate) {
          rate = value;
        } else {
          if (value > rate) {
            rate = value;
          } else if (value < rate) {
            max = decimal.min(max, value.div(rate).minus(1));
          }
        }

        return max;
      }),
      share()
    );
  };
}

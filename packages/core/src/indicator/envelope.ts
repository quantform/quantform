import { map, Observable, share } from 'rxjs';

import { sma } from './sma';

export function envelope<T>(length: number, percent: number, valueFn: (it: T) => number) {
  return function (source: Observable<T>): Observable<{ min: number; max: number }> {
    return source.pipe(
      sma(length, valueFn),
      map(([it, sma]) => {
        const offset = (sma * percent) / 100;

        return {
          min: sma - offset,
          max: sma + offset
        };
      }),
      share()
    );
  };
}

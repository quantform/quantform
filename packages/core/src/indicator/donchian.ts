import { map, Observable, share, withLatestFrom } from 'rxjs';

import { Candle } from '../domain';
import { decimal } from '../shared';
import { minMax } from './min-max';

export function donchian<T>(length: number, fn: (it: T) => Candle) {
  return function (source: Observable<T>): Observable<
    [
      T,
      {
        upper: decimal;
        lower: decimal;
      }
    ]
  > {
    source = source.pipe(share());

    return source.pipe(
      withLatestFrom(
        source.pipe(minMax(length, it => fn(it).low)),
        source.pipe(minMax(length, it => fn(it).high))
      ),
      map(([it, low, high]) => {
        const tuple: [
          T,
          {
            upper: decimal;
            lower: decimal;
          }
        ] = [it, { lower: low[1].min, upper: high[1].max }];

        return tuple;
      }),
      share()
    );
  };
}

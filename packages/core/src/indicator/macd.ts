import { Observable } from 'rxjs';
import { filter, map, share } from 'rxjs/operators';
import { EMA } from './ema';

export function macd<T>(
  fast: number,
  slow: number,
  length: number,
  fn: (it: T) => number
) {
  return function(source: Observable<T>): Observable<number> {
    const ema = {
      fast: new EMA(fast),
      slow: new EMA(slow),
      macd: new EMA(length)
    };

    return source.pipe(
      filter(it => {
        const value = fn(it);

        ema.fast.append(value);
        ema.slow.append(value);
        ema.macd.append(ema.fast.value - ema.slow.value);

        return ema.macd.isCompleted;
      }),
      map(_ => ema.macd.value),
      share()
    );
  };
}

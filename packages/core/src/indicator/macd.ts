import { Observable, withLatestFrom } from 'rxjs';
import { map, share } from 'rxjs/operators';
import { ema } from './ema';

export function macd<T>(
  fast: number,
  slow: number,
  length: number,
  fn: (it: T) => number
) {
  return function (source: Observable<T>): Observable<number> {
    source = source.pipe(share());

    return source.pipe(
      withLatestFrom(source.pipe(ema(fast, fn)), source.pipe(ema(slow, fn))),
      ema(length, it => it[1][1] - it[2][1]),
      map(([it, macd]) => macd),
      share()
    );
  };
}

import { Observable } from 'rxjs';
import { filter, map, share } from 'rxjs/operators';
import { Candle } from '../domain';
import { MinMax } from './min-max';

export function donchain<T>(length: number, fn: (it: T) => Candle) {
  return function(
    source: Observable<T>
  ): Observable<{
    timestamp: number;
    upper: number;
    middle: number;
    lower: number;
  }> {
    const min = new MinMax(length);
    const max = new MinMax(length);
    let timestamp = 0;

    return source.pipe(
      filter(it => {
        const candle = fn(it);

        timestamp = candle.timestamp;

        min.append(candle.low);
        max.append(candle.high);

        return min.isCompleted && max.isCompleted;
      }),
      map(() => ({
        timestamp,
        upper: max.max,
        middle: (min.min + max.max) / 2,
        lower: min.min
      })),
      share()
    );
  };
}

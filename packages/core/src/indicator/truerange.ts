import { Observable } from 'rxjs';
import { map, share } from 'rxjs/operators';
import { Candle } from '../domain';

export function truerange<T>(fn: (it: T) => Candle) {
  return function (source: Observable<T>): Observable<[T, number]> {
    let previous;

    return source.pipe(
      map(it => {
        const current = fn(it);

        const value =
          previous == null
            ? current.high - current.low
            : Math.max(
                Math.max(
                  current.high - current.low,
                  Math.abs(current.high - previous.close)
                ),
                Math.abs(current.low - previous.close)
              );

        const tuple: [T, number] = [it, value];

        return tuple;
      }),
      share()
    );
  };
}

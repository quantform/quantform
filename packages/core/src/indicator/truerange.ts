import { Observable } from 'rxjs';
import { map, share } from 'rxjs/operators';
import { Candle } from '../domain';

export function truerange<T>(fn: (it: T) => Candle) {
  return function(source: Observable<T>): Observable<number> {
    let previous;

    return source.pipe(
      map(it => {
        const current = fn(it);

        return previous == null
          ? current.high - current.low
          : Math.max(
              Math.max(
                current.high - current.low,
                Math.abs(current.high - previous.close)
              ),
              Math.abs(current.low - previous.close)
            );
      }),
      share()
    );
  };
}

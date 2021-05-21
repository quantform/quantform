import { Observable } from 'rxjs';
import { map, share } from 'rxjs/operators';

export function drawdown<T>(fn: (it: T) => number) {
  return function(source: Observable<T>): Observable<number> {
    let rate;
    let max = 0;

    return source.pipe(
      map(it => {
        const value = fn(it);

        if (!rate) {
          rate = value;
        } else {
          if (value > rate) {
            rate = value;
          } else if (value < rate) {
            max = Math.min(max, value / rate - 1);
          }
        }

        return max;
      }),
      share()
    );
  };
}

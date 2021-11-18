import { Observable } from 'rxjs';
import { map, share } from 'rxjs/operators';
import { sma } from './sma';

export function ema<T>(length: number, fn: (it: T) => number) {
  return function (source: Observable<T>): Observable<[T, number]> {
    const alpha = 2.0 / (length + 1);
    let value: number = null;

    return source.pipe(
      sma(length, fn),
      map(([it, sma]) => {
        if (!value) {
          value = sma;
        } else {
          value = alpha * fn(it) + (1.0 - alpha) * value;
        }

        const tuple: [T, number] = [it, value];

        return tuple;
      }),
      share()
    );
  };
}

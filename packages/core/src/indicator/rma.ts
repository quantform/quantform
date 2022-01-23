import { map, Observable, share } from 'rxjs';
import { sma } from '.';

export function rma<T>(length: number, fn: (it: T) => number) {
  return function (source: Observable<T>): Observable<[T, number]> {
    const alpha = 1.0 / length;
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

import { Observable } from 'rxjs';
import { filter, map, share } from 'rxjs/operators';
import { window } from './window-indicator';

export function minMax<T>(length: number, fn: (it: T) => number) {
  return function (source: Observable<T>): Observable<[T, { min: number; max: number }]> {
    return source.pipe(
      window(length, fn),
      filter(([, buffer]) => buffer.isFull),
      map(([it, buffer]) => {
        let min = 0;
        let max = 0;

        buffer.forEach(it => {
          min = Math.min(it, min);
          max = Math.max(it, max);
        });
        const tuple: [T, { min: number; max: number }] = [it, { min, max }];

        return tuple;
      }),
      share()
    );
  };
}

import { filter, map, Observable, share, tap } from 'rxjs';
import { window } from './window';

export function sma<T>(length: number, fn: (it: T) => number) {
  return function (source: Observable<T>): Observable<[T, number]> {
    let accumulated = 0;

    return source.pipe(
      window(length, fn),
      tap(([, , added, removed]) => {
        accumulated += added;
        accumulated -= removed;
      }),
      filter(([, buffer]) => buffer.isFull),
      map(([it, buffer]) => {
        const tuple: [T, number] = [it, accumulated / buffer.size];

        return tuple;
      }),
      share()
    );
  };
}

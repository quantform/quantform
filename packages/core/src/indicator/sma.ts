import { Observable, tap } from 'rxjs';
import { filter, map, share } from 'rxjs/operators';
import { window } from './window-indicator';

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

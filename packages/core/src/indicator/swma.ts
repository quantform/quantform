import { Observable } from 'rxjs';
import { filter, map, share } from 'rxjs/operators';
import { window } from './window';

export function swma<T>(fn: (it: T) => number) {
  return function (source: Observable<T>): Observable<[T, number]> {
    return source.pipe(
      window(4, fn),
      filter(([, buffer]) => buffer.isFull),
      map(([it, buffer]) => {
        const x3 = buffer.at(buffer.capacity - (3 + 1));
        const x2 = buffer.at(buffer.capacity - (2 + 1));
        const x1 = buffer.at(buffer.capacity - (1 + 1));
        const x0 = buffer.at(buffer.capacity - (0 + 1));

        const value = (x3 * 1) / 6 + (x2 * 2) / 6 + (x1 * 2) / 6 + (x0 * 1) / 6;

        const tuple: [T, number] = [it, value];
        return tuple;
      }),
      share()
    );
  };
}
